import type { ApiErrorResponse } from "@/shared";

export const downloadCV = async () => {
  const metaResponse = await fetch(`/api/cv`, { cache: 'no-store' });

  if (!metaResponse.ok) {
    const errorData: ApiErrorResponse = await metaResponse.json().catch(() => ({
      status: metaResponse.status,
      message: metaResponse.statusText,
    }));
    throw new Error(errorData.message || "Failed to get CV");
  }

  const meta = await metaResponse.json();
  const downloadUrl: string = meta?.cv?.downloadUrl || '/api/cv/file';
  const fallbackFilename: string = meta?.cv?.filename || 'cv.pdf';
  const target = downloadUrl.startsWith('http') ? downloadUrl : new URL(downloadUrl, window.location.origin).toString();

  const response = await fetch(target, { cache: 'no-store' });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to get CV");
  }

  // Get the filename from Content-Disposition header or use a default
  const contentDisposition = response.headers.get("Content-Disposition");
  const filename =
    contentDisposition?.match(/filename="(.+)"/)?.[1] || fallbackFilename || "cv.pdf";

  // Handle the PDF file download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
