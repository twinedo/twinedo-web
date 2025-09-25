import type { ApiErrorResponse } from "@/shared";

interface CvMetaResponse {
  status: number;
  message: string;
  cv?: {
    filename: string;
    downloadUrl: string;
    blobUrl?: string;
    size?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

const fetchCvBlobMeta = async (): Promise<NonNullable<CvMetaResponse["cv"]>> => {
  const response = await fetch(`/api/cv/blob/meta`, { cache: 'no-store' });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to get CV");
  }

  const data: CvMetaResponse = await response.json();
  if (!data.cv) {
    throw new Error(data.message || "CV not found");
  }
  return data.cv;
};

export const fetchCvMeta = fetchCvBlobMeta;

export const downloadCV = async () => {
  const meta = await fetchCvBlobMeta();
  if (!meta.downloadUrl) {
    throw new Error('CV download URL is missing');
  }
  const downloadUrl = meta.downloadUrl;
  const target = downloadUrl.startsWith('http')
    ? downloadUrl
    : new URL(downloadUrl, window.location.origin).toString();

  const response = await fetch(target, { cache: 'no-store' });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to download CV");
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  const filename =
    contentDisposition?.match(/filename="(.+)"/)?.[1] || meta.filename || "cv.pdf";

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
