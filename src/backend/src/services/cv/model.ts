import { prisma } from "../../../prisma/client";

type DbCVRecord = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  blobUrl?: string | null;
};

export const createOrUpdateCV = async (filename: string, blobUrl?: string) => {
  await prisma.cV.deleteMany({});

  return await prisma.cV.create({
    data: { filename, blobUrl }
  });
};

const normalizeRecord = (record: DbCVRecord | null): DbCVRecord | null => {
  if (!record) return null;
  return {
    id: record.id,
    filename: record.filename,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    blobUrl: record.blobUrl ?? null,
  };
};

export const getCV = async (): Promise<DbCVRecord | null> => {
  try {
    const withBlob = await prisma.$queryRaw<DbCVRecord[]>`
      SELECT id, filename, "blobUrl", "createdAt", "updatedAt"
      FROM "CV"
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `;

    if (Array.isArray(withBlob) && withBlob.length > 0) {
      return normalizeRecord(withBlob[0]);
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const code = (error as unknown as { code?: string }).code;
    if (code !== '42703' && code !== '42P01') {
      throw error;
    }
    // Column doesn't exist (older schema) - fall back below
  }

  try {
    const withoutBlob = await prisma.$queryRaw<DbCVRecord[]>`
      SELECT id, filename, NULL::text AS "blobUrl", "createdAt", "updatedAt"
      FROM "CV"
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `;

    if (Array.isArray(withoutBlob) && withoutBlob.length > 0) {
      return normalizeRecord(withoutBlob[0]);
    }
  } catch (error) {
    console.error('Fallback CV query failed:', error);
    throw error;
  }

  return null;
};
