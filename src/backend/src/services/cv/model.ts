import { prisma } from "../../../prisma/client";

const DEFAULT_CV_FILENAME = "Twin Edo Nugraha - CV.pdf";

type DbCVRecord = {
  id: string;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  blobUrl?: string | null;
};

type CacheAwareCVDelegate = typeof prisma.cV & {
  findFirst: (
    args: (Parameters<typeof prisma.cV.findFirst>[0] & { cacheStrategy?: { ttl: number } })
  ) => ReturnType<typeof prisma.cV.findFirst>;
};

export const createOrUpdateCV = async (filename: string, blobUrl?: string): Promise<DbCVRecord | null> => {
  const targetFilename = filename || DEFAULT_CV_FILENAME;

  const record = await prisma.cV.upsert({
    where: { filename: targetFilename },
    update: {
      blobUrl,
      // filename is still updated in case the constant ever changes
      filename: targetFilename,
    },
    create: {
      filename: targetFilename,
      blobUrl,
    },
  });

  return normalizeRecord(record as unknown as DbCVRecord);
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
    const direct = await prisma.cV.findUnique({
      where: { filename: DEFAULT_CV_FILENAME },
      select: {
        id: true,
        filename: true,
        createdAt: true,
        updatedAt: true,
        blobUrl: true,
      },
    });

    if (direct) {
      return normalizeRecord(direct as unknown as DbCVRecord);
    }

    const cacheAwareDelegate = prisma.cV as CacheAwareCVDelegate;
    const record = await cacheAwareDelegate.findFirst({
      select: {
        id: true,
        filename: true,
        createdAt: true,
        updatedAt: true,
        blobUrl: true,
      },
      orderBy: { updatedAt: 'desc' },
      cacheStrategy: { ttl: 0 },
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
