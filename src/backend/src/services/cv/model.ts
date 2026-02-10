import { readdir, stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "../../../prisma/client";
import { resolveCVUploadDir } from "../../utils/paths";
import { getLatestBlobCv, uploadCvToBlob, type BlobCvFile } from "./blobService";

const DEFAULT_CV_FILENAME = "Twin Edo Nugraha - CV.pdf";

type PrismaCVRecord = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  blobUrl: string | null;
};

export type CvRecord = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  blobUrl?: string | null;
  size?: number;
};

const normalizePrismaRecord = (record: PrismaCVRecord, size?: number): CvRecord => ({
  id: record.id,
  filename: record.filename,
  createdAt: new Date(record.createdAt),
  updatedAt: new Date(record.updatedAt),
  blobUrl: record.blobUrl ?? null,
  size,
});

const buildBlobRecord = (blob: BlobCvFile): CvRecord => ({
  id: blob.filename,
  filename: blob.filename,
  createdAt: blob.uploadedAt,
  updatedAt: blob.uploadedAt,
  blobUrl: blob.url,
  size: blob.size,
});

const getFilePath = (filename: string) => join(resolveCVUploadDir(), filename);

const statToRecord = async (filename: string) => {
  try {
    const filePath = getFilePath(filename);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return null;
    }

    const createdAt = fileStat.birthtimeMs > 0 ? new Date(fileStat.birthtimeMs) : new Date(fileStat.ctimeMs);

    return {
      id: filename,
      filename,
      createdAt,
      updatedAt: new Date(fileStat.mtimeMs),
      blobUrl: null,
      size: fileStat.size,
    } satisfies CvRecord;
  } catch {
    return null;
  }
};

const getLocalCv = async (): Promise<CvRecord | null> => {
  const primary = await statToRecord(DEFAULT_CV_FILENAME);
  if (primary) {
    return primary;
  }

  try {
    const entries = await readdir(resolveCVUploadDir(), { withFileTypes: true });
    const firstPdf = entries.find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"));
    if (firstPdf) {
      return statToRecord(firstPdf.name);
    }
  } catch {
    // Directory might not exist yet.
  }

  return null;
};

const getDbCv = async (): Promise<CvRecord | null> => {
  try {
    const cached = await prisma.cV.findUnique({
      where: { filename: DEFAULT_CV_FILENAME },
      select: {
        id: true,
        filename: true,
        createdAt: true,
        updatedAt: true,
        blobUrl: true,
      },
    });

    if (cached) {
      return normalizePrismaRecord(cached);
    }

    const fallback = await prisma.cV.findFirst({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        filename: true,
        createdAt: true,
        updatedAt: true,
        blobUrl: true,
      },
    });

    if (fallback) {
      return normalizePrismaRecord(fallback);
    }
  } catch (error) {
    console.error("Prisma CV lookup failed:", error);
  }

  return null;
};

const isMissingBlobColumnError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const code = (error as { code?: string }).code;
  const message = (error as { message?: string }).message ?? "";

  return (
    code === "P2010" ||
    code === "P2021" ||
    /column\s+"?bloburl"?\s+does\s+not\s+exist/i.test(message)
  );
};

const upsertWithoutBlobColumn = async (filename: string) => {
  const results = await prisma.$queryRaw<
    Array<{ id: string; filename: string; createdAt: Date; updatedAt: Date }>
  >`
    INSERT INTO "CV" ("filename")
    VALUES (${filename})
    ON CONFLICT ("filename")
    DO UPDATE SET "filename" = EXCLUDED."filename", "updatedAt" = NOW()
    RETURNING "id", "filename", "createdAt", "updatedAt"
  `;

  if (!results || results.length === 0) {
    throw new Error('Failed to upsert CV record without blob column.');
  }

  const record = results[0];

  if (!record) {
    throw new Error('Failed to upsert CV record without blob column (result missing).');
  }

  const fallbackRecord: CvRecord = {
    id: record.id,
    filename: record.filename,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    blobUrl: null,
  };

  return fallbackRecord;
};

export const createOrUpdateCV = async (
  filename: string,
  blobMeta?: { url: string; size?: number; uploadedAt?: Date }
): Promise<CvRecord | null> => {
  const targetFilename = filename || DEFAULT_CV_FILENAME;

  try {
    const record = await prisma.cV.upsert({
      where: { filename: targetFilename },
      update: {
        filename: targetFilename,
        blobUrl: blobMeta?.url ?? null,
      },
      create: {
        filename: targetFilename,
        blobUrl: blobMeta?.url ?? null,
      },
    });

    return normalizePrismaRecord(record, blobMeta?.size);
  } catch (error) {
    if (isMissingBlobColumnError(error)) {
      console.warn(
        '⚠️  CV table missing "blobUrl" column. Falling back to metadata-only update. ' +
        'Run the CV blob migration to finish the upgrade.'
      );
      try {
        const result = await upsertWithoutBlobColumn(targetFilename);
        return {
          ...result,
          blobUrl: blobMeta?.url ?? null,
          size: blobMeta?.size,
        };
      } catch (fallbackError) {
        console.error("Fallback CV upsert failed:", fallbackError);
        return null;
      }
    }
    console.error("Failed to persist CV metadata:", error);
    return null;
  }
};

export const getCV = async (): Promise<CvRecord | null> => {
  const dbCv = await getDbCv();
  if (dbCv?.blobUrl) {
    return dbCv;
  }

  try {
    const blobCv = await getLatestBlobCv();
    if (blobCv) {
      if (!dbCv || !dbCv.blobUrl) {
        await createOrUpdateCV(blobCv.filename, {
          url: blobCv.url,
          size: blobCv.size,
          uploadedAt: blobCv.uploadedAt,
        });
      }
      return buildBlobRecord(blobCv);
    }
  } catch (error) {
    console.error("Failed to resolve blob CV record:", error);
  }

  if (dbCv) {
    return dbCv;
  }

  const migrated = await ensureBlobFromLocal();
  if (migrated) {
    return migrated;
  }

  return getLocalCv();
};

const ensureBlobFromLocal = async (): Promise<CvRecord | null> => {
  const hasBlobCredentials = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  if (!hasBlobCredentials) {
    return null;
  }

  const localCv = await getLocalCv();
  if (!localCv) {
    return null;
  }

  try {
    const filePath = getFilePath(localCv.filename);
    const fileBytes = await readFile(filePath);
    const blob = await uploadCvToBlob(localCv.filename, Buffer.from(fileBytes));

    await createOrUpdateCV(localCv.filename, {
      url: blob.url,
      size: fileBytes.byteLength,
      uploadedAt: new Date(),
    });

    return buildBlobRecord({
      filename: localCv.filename,
      url: blob.url,
      uploadedAt: new Date(),
      size: fileBytes.byteLength,
    });
  } catch (error) {
    console.error("Failed to migrate local CV to blob storage:", error);
    return localCv;
  }
};
