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

class CvServiceError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const fetchCvBlobMeta = async (): Promise<NonNullable<CvMetaResponse["cv"]>> => {
  const response = await fetch(`/api/cv/blob/meta`, { cache: 'no-store' });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new CvServiceError(errorData.message || "Failed to get CV", errorData.status ?? response.status);
  }

  const data: CvMetaResponse = await response.json();
  if (!data.cv) {
    throw new CvServiceError(data.message || "CV not found", data.status ?? response.status);
  }
  return data.cv;
};

const fetchLegacyMeta = async (): Promise<NonNullable<CvMetaResponse["cv"]>> => {
  const response = await fetch(`/api/cv`, { cache: 'no-store' });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new CvServiceError(errorData.message || "Failed to get CV", errorData.status ?? response.status);
  }

  const data = await response.json();
  if (!data?.cv) {
    throw new CvServiceError(data?.message || "CV not found", data?.status ?? response.status);
  }

  return {
    filename: data.cv.filename,
    downloadUrl: '/api/cv/file',
    blobUrl: data.cv.blobUrl,
    createdAt: data.cv.createdAt,
    updatedAt: data.cv.updatedAt,
  };
};

export const fetchCvMeta = async () => {
  try {
    return await fetchCvBlobMeta();
  } catch (error) {
    if (error instanceof CvServiceError && error.status === 404) {
      try {
        return await fetchLegacyMeta();
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
    throw error;
  }
};

export const downloadCV = async () => {
  let meta: NonNullable<CvMetaResponse["cv"]>;
  try {
    meta = await fetchCvBlobMeta();
  } catch (error) {
    if (error instanceof CvServiceError && error.status === 404) {
      meta = await fetchLegacyMeta();
    } else {
      throw error;
    }
  }

  if (!meta.downloadUrl) {
    throw new Error('CV download URL is missing');
  }

  const target = meta.downloadUrl.startsWith('http')
    ? meta.downloadUrl
    : new URL(meta.downloadUrl, window.location.origin).toString();

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
