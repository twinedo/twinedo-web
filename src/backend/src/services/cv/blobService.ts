import { list } from '@vercel/blob';

export interface BlobCvFile {
  filename: string;
  url: string;
  uploadedAt: Date;
  size: number;
}

const CV_PREFIX = 'cv/';

export const getLatestBlobCv = async (): Promise<BlobCvFile | null> => {
  try {
    const response = await list({ prefix: CV_PREFIX, limit: 20 });
    if (!response.blobs || response.blobs.length === 0) {
      return null;
    }

    const sorted = [...response.blobs].sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    const latest = sorted[0];
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
    console.error('Failed to list CV blob files:', error);
    return null;
  }
};
