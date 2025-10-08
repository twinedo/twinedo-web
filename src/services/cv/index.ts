import type { ApiErrorResponse } from "@/shared";

export interface CvMeta {
  filename: string;
  downloadUrl: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

const getCvMetaFromApi = async (): Promise<CvMeta | null> => {
  const response = await fetch(`/api/cv`, { cache: "no-store" });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to get CV");
  }

  const data = await response.json();
  const cv = data?.cv;

  if (!cv?.downloadUrl || !cv?.filename) {
    throw new Error("CV metadata is incomplete");
  }

  return {
    filename: cv.filename,
    downloadUrl: cv.downloadUrl,
    size: cv.size,
    createdAt: cv.createdAt,
    updatedAt: cv.updatedAt,
  } satisfies CvMeta;
};

export const fetchCvMeta = async () => getCvMetaFromApi();

export const downloadCV = async () => {
  const meta = await getCvMetaFromApi();

  if (!meta) {
    throw new Error("No CV available for download");
  }

  const target = meta.downloadUrl.startsWith("http")
    ? meta.downloadUrl
    : new URL(meta.downloadUrl, window.location.origin).toString();

  const response = await fetch(target, { cache: "no-store" });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to download CV");
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  const fallbackName = meta.filename || "cv.pdf";
  const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] ?? fallbackName;

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
};
