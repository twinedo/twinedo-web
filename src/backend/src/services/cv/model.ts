import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { resolveCVUploadDir } from "../../utils/paths";
import { getLatestBlobCv, type BlobCvFile } from "./blobService";

const DEFAULT_CV_FILENAME = "Twin Edo Nugraha - CV.pdf";

export type CvRecord = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  blobUrl?: string | null;
  size?: number;
};

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

export const createOrUpdateCV = async (
  filename: string,
  blobMeta?: { url: string; size: number; uploadedAt?: Date }
): Promise<CvRecord | null> => {
  if (blobMeta) {
    return {
      id: filename,
      filename,
      createdAt: blobMeta.uploadedAt ?? new Date(),
      updatedAt: blobMeta.uploadedAt ?? new Date(),
      blobUrl: blobMeta.url,
      size: blobMeta.size,
    } satisfies CvRecord;
  }

  return statToRecord(filename || DEFAULT_CV_FILENAME);
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

export const getCV = async (): Promise<CvRecord | null> => {
  try {
    const blobCv = await getLatestBlobCv();
    if (blobCv) {
      return buildBlobRecord(blobCv);
    }
  } catch (error) {
    console.error("Failed to resolve blob CV record:", error);
  }

  return getLocalCv();
};
