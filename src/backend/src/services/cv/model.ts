import { prisma } from "../../../prisma/client";

type DbCVRecord = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  blobUrl?: string | null;
};

export const createOrUpdateCV = async (filename: string, blobUrl?: string) => {
  const existing = await prisma.cV.findFirst({
    select: { id: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (existing) {
    return await prisma.cV.update({
      where: { id: existing.id },
      data: {
        filename,
        blobUrl,
        updatedAt: new Date(),
      },
    });
  }

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
      select: {
        id: true,
        filename: true,
        createdAt: true,
        updatedAt: true,
        blobUrl: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (record) {
      return normalizeRecord(record as unknown as DbCVRecord);
    }
  } catch (error) {
    console.error('Prisma CV lookup failed:', error);
  }

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
    if (!(rawError instanceof Error)) {
      console.error('Unknown CV raw query error:', rawError);
      return null;
    }
    const code = (rawError as unknown as { code?: string }).code;
    if (code !== '42703' && code !== '42P01') {
      console.error('Unexpected CV raw query error:', rawError);
      return null;
    }
    // Column missing, fall through
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
  } catch (fallbackError) {
    console.error('Fallback CV query failed:', fallbackError);
  }

  return null;
};
