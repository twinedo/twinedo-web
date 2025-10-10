#!/usr/bin/env node
import 'dotenv/config';
import { list } from '@vercel/blob';
import { writeFile } from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const HELP_TEXT = `
Usage:
  node cv-blob-tools.js list
      Show the most recent CV blob stored under the "cv/" prefix.

  node cv-blob-tools.js download <target-path>
      Download the latest CV blob to the provided file path.

  node cv-blob-tools.js sync-db
      Ensure the Prisma "CV" record points to the latest blob URL.
`.trim();

const CV_PREFIX = 'cv/';

const isMissingBlobColumnError = (error) => {
  if (!error || typeof error !== 'object') return false;
  const code = error.code;
  const message = error.message ?? '';
  return (
    code === 'P2010' ||
    code === 'P2021' ||
    /column\s+"?bloburl"?\s+does\s+not\s+exist/i.test(message)
  );
};

async function upsertWithoutBlobColumn(prisma, filename) {
  const result = await prisma.$queryRaw`
    INSERT INTO "CV" ("filename")
    VALUES (${filename})
    ON CONFLICT ("filename")
    DO UPDATE SET "filename" = EXCLUDED."filename", "updatedAt" = NOW()
    RETURNING "id", "filename", "createdAt", "updatedAt"
  `;

  if (!result || result.length === 0) {
    throw new Error('Raw CV upsert failed.');
  }

  return {
    id: result[0].id,
    filename: result[0].filename,
    createdAt: new Date(result[0].createdAt),
    updatedAt: new Date(result[0].updatedAt),
    blobUrl: null,
  };
}

async function resolveLatest() {
  try {
    const response = await list({ prefix: CV_PREFIX, limit: 20 });

    if (!response.blobs?.length) {
      console.error('❌ No blobs found under the "cv/" prefix.');
      return null;
    }

    const latest = [...response.blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    const filename = latest.pathname.startsWith(CV_PREFIX)
      ? latest.pathname.slice(CV_PREFIX.length)
      : latest.pathname;

    return {
      filename,
      url: latest.url,
      size: latest.size,
      uploadedAt: new Date(latest.uploadedAt),
    };
  } catch (error) {
    console.error('❌ Failed to list CV blobs:', error);
    return null;
  }
}

async function downloadLatest(targetPath) {
  const latest = await resolveLatest();
  if (!latest) {
    process.exitCode = 1;
    return;
  }

  try {
    const response = await fetch(latest.url);
    if (!response.ok) {
      throw new Error(`Failed to download blob. Status: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(targetPath, buffer);
    console.log(`✅ Downloaded "${latest.filename}" to ${targetPath}`);
  } catch (error) {
    console.error('❌ Failed to download blob:', error);
    process.exitCode = 1;
  }
}

async function syncDatabaseWithLatest() {
  const latest = await resolveLatest();
  if (!latest) {
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  try {
    try {
      const record = await prisma.cV.upsert({
        where: { filename: latest.filename },
        update: { blobUrl: latest.url },
        create: {
          filename: latest.filename,
          blobUrl: latest.url,
        },
      });

      console.log(`✅ Database record synced for "${record.filename}".`);
      console.log(`   Blob URL: ${latest.url}`);
    } catch (error) {
      if (!isMissingBlobColumnError(error)) {
        throw error;
      }

      console.warn(
        '⚠️  CV table missing "blobUrl" column. Applying metadata-only fallback. ' +
        'Run the CV blob migration when you obtain owner credentials.'
      );

      const record = await upsertWithoutBlobColumn(prisma, latest.filename);
      console.log(`✅ Metadata updated for "${record.filename}".`);
      console.log(`   Add the "blobUrl" column later to store the blob URL.`);
    }
  } catch (error) {
    console.error('❌ Failed to sync database record:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const [, , command, ...rest] = process.argv;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Missing BLOB_READ_WRITE_TOKEN. Set it in your environment to access Vercel Blob.');
    process.exit(1);
  }

  switch (command) {
    case 'list': {
      const latest = await resolveLatest();
      if (latest) {
        console.log('✅ Latest CV blob');
        console.log(`   Filename:   ${latest.filename}`);
        console.log(`   URL:        ${latest.url}`);
        console.log(`   Size:       ${latest.size} bytes`);
        console.log(`   UploadedAt: ${latest.uploadedAt.toISOString()}`);
      } else {
        process.exitCode = 1;
      }
      break;
    }
    case 'download': {
      const target = rest[0];
      if (!target) {
        console.error('❌ Provide a target file path.\n');
        console.log(HELP_TEXT);
        process.exitCode = 1;
        return;
      }
      await downloadLatest(target);
      break;
    }
    case 'sync-db': {
      await syncDatabaseWithLatest();
      break;
    }
    default: {
      console.log(HELP_TEXT);
      process.exitCode = 1;
    }
  }
}

await main();
