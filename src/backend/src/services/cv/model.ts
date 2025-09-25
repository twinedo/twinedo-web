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
    const record = await prisma.cV.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return normalizeRecord(record as DbCVRecord | null);
  } catch (error) {
    console.error('Prisma CV lookup failed:', error);

    // Fallback to raw queries when using Accelerate or legacy schema issues
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
    } catch (rawError) {
      if (!(rawError instanceof Error)) throw rawError;
      const code = (rawError as unknown as { code?: string }).code;
      if (code !== '42703' && code !== '42P01') {
        throw rawError;
      }
      // Column missing; fallthrough to no-blob query
    }

    const withoutBlob = await prisma.$queryRaw<DbCVRecord[]>`
      SELECT id, filename, NULL::text AS "blobUrl", "createdAt", "updatedAt"
      FROM "CV"
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `;

    if (Array.isArray(withoutBlob) && withoutBlob.length > 0) {
      return normalizeRecord(withoutBlob[0]);
    }

    return null;
  }
};
