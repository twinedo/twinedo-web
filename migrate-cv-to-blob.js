// migrate-cv-to-blob.js
import 'dotenv/config';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const CV_UPLOAD_DIR = 'src/backend/src/uploads/cv';
const DRY_RUN = false; // Set to true to see what would happen without actually uploading

function createPrismaClient() {
  const candidates = [
    { name: 'DIRECT_DATABASE_URL', value: process.env.DIRECT_DATABASE_URL },
    { name: 'DATABASE_DIRECT_URL', value: process.env.DATABASE_DIRECT_URL },
    { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
  ];

  const selected = candidates.find((candidate) => typeof candidate.value === 'string' && candidate.value.trim().length > 0);
  const databaseUrl = selected?.value?.trim();

  if (!databaseUrl) {
    console.error('❌ Missing database connection string. Set DIRECT_DATABASE_URL (preferred) or DATABASE_URL.');
    process.exit(1);
  }

  console.log(`🔌 Using database URL from ${selected?.name}.`);

  if (databaseUrl.startsWith('prisma://')) {
    console.error('❌ This migration needs a direct Postgres connection (owner privileges).');
    console.error('   Set DIRECT_DATABASE_URL to your direct database URL and rerun the script.');
    process.exit(1);
  }

  return new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });
}

async function ensureBlobUrlColumn(prisma) {
  const columns = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'CV' AND column_name = 'blobUrl'
  `;

  if (!Array.isArray(columns) || columns.length === 0) {
    console.log('ℹ️  Adding missing "blobUrl" column to "CV" table...');
    try {
      await prisma.$executeRaw`ALTER TABLE "CV" ADD COLUMN "blobUrl" TEXT`;
    } catch (error) {
      if (error?.meta?.code === '42501' || /42501/.test(error?.message ?? '')) {
        console.error('❌ Database user does not own table "CV". Connect with the owning role (e.g. direct service/owner credentials) and rerun.');
        throw error;
      }
      throw error;
    }
    console.log('✅ Column added.');
  }
}

async function migrateCVToBlob() {
  const prisma = createPrismaClient();
  console.log('🚀 Starting CV migration to Vercel Blob...');
  console.log(`📂 Source directory: ${CV_UPLOAD_DIR}`);
  console.log(`🔄 Dry run mode: ${DRY_RUN}`);
  console.log('');

  try {
    await ensureBlobUrlColumn(prisma);

    // Check if CV directory exists
    if (!existsSync(CV_UPLOAD_DIR)) {
      console.error(`❌ CV directory not found: ${CV_UPLOAD_DIR}`);
      return;
    }

    // Get CV record from database
    const cv = await prisma.cV.findFirst();
    if (!cv) {
      console.error('❌ No CV record found in database');
      return;
    }

    console.log(`📄 Found CV record: ${cv.filename}`);

    // Check if already migrated
    if (cv.blobUrl) {
      console.log(`✅ CV already migrated: ${cv.blobUrl}`);
      return;
    }

    const filePath = join(CV_UPLOAD_DIR, cv.filename);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      console.error(`❌ CV file not found: ${filePath}`);
      return;
    }

    console.log(`📤 Uploading ${cv.filename} to Vercel Blob...`);

    if (!DRY_RUN) {
      // Read file
      const fileBuffer = await readFile(filePath);
      
      // Upload to Vercel Blob
      const blobPath = `cv/${cv.filename}`;
      const blob = await put(blobPath, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Update database record
      await prisma.cV.update({
        where: { id: cv.id },
        data: { blobUrl: blob.url }
      });

      console.log(`✅ Successfully uploaded CV to: ${blob.url}`);
      console.log(`✅ Database updated with blob URL`);
    } else {
      console.log(`🔍 Would upload: cv/${cv.filename}`);
      console.log(`🔍 Would update database record: ${cv.id}`);
    }

    console.log('\n🎉 CV migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCVToBlob();
