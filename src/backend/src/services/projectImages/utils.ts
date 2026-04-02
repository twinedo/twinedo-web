import { readFile } from "node:fs/promises";
import { extname, isAbsolute, join } from "node:path";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const LEGACY_DISPLAY_VALUES = new Set(["active", "inactive"]);

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

let cachedProjectsUploadDir: string | null = null;

type ImageCandidate = {
  bucket: string;
  filename: string | null;
  remoteUrl: string | null;
};

const isImageFilename = (value: string) => {
  const extension = extname(value).toLowerCase();
  return Boolean(CONTENT_TYPES[extension]);
};

export const resolveProjectsUploadDir = () => {
  if (cachedProjectsUploadDir) {
    return cachedProjectsUploadDir;
  }

  const envPath = process.env.PROJECTS_UPLOAD_DIR;
  const fallbackPath = join(process.cwd(), "public", "projects");

  if (!envPath) {
    cachedProjectsUploadDir = fallbackPath;
    return fallbackPath;
  }

  cachedProjectsUploadDir = isAbsolute(envPath)
    ? envPath
    : join(process.cwd(), envPath);

  return cachedProjectsUploadDir;
};

export const getProjectImageProxyUrl = (bucket: string, filename: string) =>
  `/api/images/file/${encodeURIComponent(bucket)}/${encodeURIComponent(filename)}`;

export const getProjectThumbnailProxyUrl = (bucket: string) =>
  `/api/images/thumbnail/${encodeURIComponent(bucket)}`;

export const extractFilenameFromReference = (value?: string | null) => {
  const normalized = value?.trim();

  if (!normalized || LEGACY_DISPLAY_VALUES.has(normalized.toLowerCase())) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(normalized)) {
    try {
      const url = new URL(normalized);
      const filename = decodeURIComponent(
        url.pathname.split("/").filter(Boolean).pop() ?? ""
      );

      return isImageFilename(filename) ? filename : null;
    } catch {
      return null;
    }
  }

  const pathWithoutQuery = normalized.split("#")[0]?.split("?")[0] ?? normalized;
  const filename = decodeURIComponent(
    pathWithoutQuery.split("/").filter(Boolean).pop() ?? ""
  );

  return isImageFilename(filename) ? filename : null;
};

export const createImageCandidate = (
  bucket: string,
  value?: { filename?: string | null; blobUrl?: string | null } | null
): ImageCandidate | null => {
  if (!value) {
    return null;
  }

  const filename = value.filename?.trim() || extractFilenameFromReference(value.blobUrl);
  const remoteUrl =
    value.blobUrl && ABSOLUTE_URL_PATTERN.test(value.blobUrl) ? value.blobUrl : null;

  if (!filename && !remoteUrl) {
    return null;
  }

  return {
    bucket,
    filename: filename ?? null,
    remoteUrl,
  };
};

export const createLegacyDisplayCandidate = (bucket: string, display?: string | null) => {
  const normalized = display?.trim();

  if (!normalized || LEGACY_DISPLAY_VALUES.has(normalized.toLowerCase())) {
    return null;
  }

  return {
    bucket,
    filename: extractFilenameFromReference(normalized),
    remoteUrl: ABSOLUTE_URL_PATTERN.test(normalized) ? normalized : null,
  } satisfies ImageCandidate;
};

export const dedupeImageCandidates = (candidates: Array<ImageCandidate | null>) => {
  const seen = new Set<string>();

  return candidates.filter((candidate): candidate is ImageCandidate => {
    if (!candidate) {
      return false;
    }

    const key = `${candidate.bucket}|${candidate.filename ?? ""}|${candidate.remoteUrl ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const serveRemoteImage = async (url?: string | null) => {
  if (!url || !ABSOLUTE_URL_PATTERN.test(url)) {
    return null;
  }

  try {
    const response = await fetch(url);

    if (!response.ok || !response.body) {
      return null;
    }

    return new Response(response.body, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type":
          response.headers.get("content-type") ?? "application/octet-stream",
      },
    });
  } catch {
    return null;
  }
};

export const serveLocalProjectImage = async (
  bucket: string,
  filename?: string | null
) => {
  if (!filename) {
    return null;
  }

  try {
    const filePath = join(resolveProjectsUploadDir(), bucket, filename);
    const fileBuffer = await readFile(filePath);

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type": CONTENT_TYPES[extname(filename).toLowerCase()] ?? "application/octet-stream",
      },
    });
  } catch {
    return null;
  }
};
