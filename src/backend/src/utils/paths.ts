import getConfig from 'next/config';
import { isAbsolute, join } from 'node:path';

let cachedCvUploadDir: string | null = null;

const resolveFromRuntimeConfig = () => {
  try {
    const runtimeConfig = getConfig();
    const runtimePath = runtimeConfig?.serverRuntimeConfig?.CV_UPLOAD_DIR;
    if (runtimePath) {
      return runtimePath as string;
    }
  } catch {
    // We're likely being executed outside of Next.js (e.g. scripts)
  }
  return null;
};

const resolveFromEnv = () => {
  const envPath = process.env.CV_UPLOAD_DIR;
  if (!envPath) return null;
  return isAbsolute(envPath) ? envPath : join(process.cwd(), envPath);
};

export const resolveCVUploadDir = () => {
  if (cachedCvUploadDir) {
    return cachedCvUploadDir;
  }

  const runtimePath = resolveFromRuntimeConfig();
  if (runtimePath) {
    cachedCvUploadDir = runtimePath;
    return runtimePath;
  }

  const envPath = resolveFromEnv();
  if (envPath) {
    cachedCvUploadDir = envPath;
    return envPath;
  }

  const defaultPath = join(process.cwd(), 'public', 'cv');
  cachedCvUploadDir = defaultPath;
  return defaultPath;
};
