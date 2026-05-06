import { del, list, put } from "@vercel/blob";

export interface BlobCvFile {
  filename: string;
  url: string;
  uploadedAt: Date;
  size: number;
}

const CV_PREFIX = "cv/";

const listAllCvBlobs = async () => {
  const blobs: Awaited<ReturnType<typeof list>>["blobs"] = [];
  let cursor: string | undefined;

  do {
    const response = await list({ prefix: CV_PREFIX, limit: 1000, cursor });
    blobs.push(...(response.blobs ?? []));
    cursor = response.hasMore ? response.cursor : undefined;
  } while (cursor);

  return blobs;
};

export const getLatestBlobCv = async (): Promise<BlobCvFile | null> => {
  try {
    const blobs = await listAllCvBlobs();
    if (!blobs.length) {
      return null;
    }

    const latest = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    if (!latest) {
      return null;
    }

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
    allowOverwrite: true,
  });
};

export const deleteStaleCvBlobs = async (currentUrl: string) => {
  const blobs = await listAllCvBlobs();
  const staleUrls = blobs.filter((blob) => blob.url !== currentUrl).map((blob) => blob.url);

  if (staleUrls.length === 0) {
    return;
  }

  await del(staleUrls);
};
