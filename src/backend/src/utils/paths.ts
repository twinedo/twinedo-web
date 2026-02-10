
import { isAbsolute, join } from 'node:path';

let cachedCvUploadDir: string | null = null;

const resolveFromEnv = () => {
  const envPath = process.env.CV_UPLOAD_DIR;
  if (!envPath) return null;
  return isAbsolute(envPath) ? envPath : join(process.cwd(), envPath);
};

export const resolveCVUploadDir = () => {
  if (cachedCvUploadDir) {
    return cachedCvUploadDir;
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
