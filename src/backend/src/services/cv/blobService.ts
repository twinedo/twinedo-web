import { list, put } from "@vercel/blob";

export interface BlobCvFile {
  filename: string;
  url: string;
  uploadedAt: Date;
  size: number;
}

const CV_PREFIX = "cv/";

export const getLatestBlobCv = async (): Promise<BlobCvFile | null> => {
  try {
    const response = await list({ prefix: CV_PREFIX, limit: 20 });
    if (!response.blobs?.length) {
      return null;
    }

    const latest = [...response.blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    const filename = latest.pathname.startsWith(CV_PREFIX)
      ? latest.pathname.slice(CV_PREFIX.length)
      : latest.pathname;

    return {
      filename,
      url: latest.url,
      uploadedAt: new Date(latest.uploadedAt),
      size: latest.size,
    };
  } catch (error) {
    console.error("Failed to list CV blob files:", error);
    return null;
  }
};

export const uploadCvToBlob = async (filename: string, fileBuffer: Buffer) => {
  const pathname = `${CV_PREFIX}${filename}`;
  return put(pathname, fileBuffer, {
    access: "public",
    addRandomSuffix: false,
  });
};
