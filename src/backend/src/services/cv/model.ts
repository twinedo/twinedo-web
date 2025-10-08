import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { resolveCVUploadDir } from "../../utils/paths";

const DEFAULT_CV_FILENAME = "Twin Edo Nugraha - CV.pdf";

export type CvRecord = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  blobUrl?: string | null;
  size?: number;
};

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

export const createOrUpdateCV = async (filename: string): Promise<CvRecord | null> => {
  // After the file is written to disk we simply rescan for metadata.
  return statToRecord(filename || DEFAULT_CV_FILENAME);
};

export const getCV = async (): Promise<CvRecord | null> => {
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
