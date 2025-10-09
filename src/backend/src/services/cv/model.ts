import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "../../../prisma/client";
import { resolveCVUploadDir } from "../../utils/paths";
import { getLatestBlobCv, type BlobCvFile } from "./blobService";

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

  return getLocalCv();
};
