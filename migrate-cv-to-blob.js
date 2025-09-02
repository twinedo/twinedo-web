// migrate-cv-to-blob.js
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from './src/backend/prisma/client/index.js';

const CV_UPLOAD_DIR = 'src/backend/src/uploads/cv';
const DRY_RUN = false; // Set to true to see what would happen without actually uploading

async function migrateCVToBlob() {
  console.log('🚀 Starting CV migration to Vercel Blob...');
  console.log(`📂 Source directory: ${CV_UPLOAD_DIR}`);
  console.log(`🔄 Dry run mode: ${DRY_RUN}`);
  console.log('');

  try {
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