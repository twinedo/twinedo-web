import { mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import getConfig from 'next/config';

const { PROJECTS_UPLOAD_DIR } = getConfig().serverRuntimeConfig;

export const ensureBucketExists = async (bucket: string) => {
  const bucketDir = join(PROJECTS_UPLOAD_DIR, bucket);
  await mkdir(bucketDir, { recursive: true });
  return bucketDir;
};

export const parseDescription = (desc: string | string[] | undefined | null): string[] => {
  if (!desc) return [];
  if (Array.isArray(desc)) return desc.filter(line => line.trim());
  return desc.split('\n').filter(line => line.trim());
};

export const deleteProjectFiles = async (bucket: string, filenames: string[]) => {
  const bucketDir = join(PROJECTS_UPLOAD_DIR, bucket);
  await Promise.all(
    filenames.map(file => 
      unlink(join(bucketDir, file)).catch(() => {})
    )
  );
};