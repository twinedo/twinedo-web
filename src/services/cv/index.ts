import type { ApiErrorResponse } from "@/shared";

export const downloadCV = async () => {
  const response = await fetch(`/api/cv/download`);

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
    contentDisposition?.match(/filename="(.+)"/)?.[1] || "cv.pdf";

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
