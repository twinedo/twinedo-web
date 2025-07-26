// migrate-images-to-blob.js
import { put } from '@vercel/blob';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from './src/backend/prisma/client'
// Configuration
const UPLOADS_DIR = 'src/backend/src/uploads/projects';
const DRY_RUN = true; // Set to false to actually migrate

async function migrateImages() {
  console.log('🚀 Starting image migration to Vercel Blob...');
  console.log(`📂 Source directory: ${UPLOADS_DIR}`);
  console.log(`🔄 Dry run mode: ${DRY_RUN}`);
  console.log('');

  try {
    // Check if uploads directory exists
    if (!existsSync(UPLOADS_DIR)) {
      console.error(`❌ Upload directory not found: ${UPLOADS_DIR}`);
      return;
    }

    // Get all project buckets (subdirectories)
    const buckets = await readdir(UPLOADS_DIR);
    console.log(`📁 Found ${buckets.length} buckets: ${buckets.join(', ')}`);
    console.log('');

    let totalFiles = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const bucket of buckets) {
      const bucketPath = join(UPLOADS_DIR, bucket);
      
      // Check if it's a directory
      const bucketStat = await stat(bucketPath);
      if (!bucketStat.isDirectory()) {
        console.log(`⏭️  Skipping ${bucket} (not a directory)`);
        continue;
      }

      console.log(`\n📂 Processing bucket: ${bucket}`);
      
      try {
        const files = await readdir(bucketPath);
        console.log(`   Found ${files.length} files`);

        for (const filename of files) {
          const filePath = join(bucketPath, filename);
          totalFiles++;

          try {
            // Check if file exists in database
            const existingRecord = await prisma.projectImage.findFirst({
              where: { bucket, filename }
            });

            if (!existingRecord) {
              console.log(`   ⚠️  No database record found for ${filename}`);
              continue;
            }

            // Check if already migrated
            if (existingRecord.blobUrl) {
              console.log(`   ✅ ${filename} already migrated`);
              successCount++;
              continue;
            }

            console.log(`   📤 Uploading ${filename}...`);

            if (!DRY_RUN) {
              // Read file
              const fileBuffer = await readFile(filePath);
              
              // Upload to Vercel Blob
              const blobPath = `${bucket}/${filename}`;
              const blob = await put(blobPath, fileBuffer, {
                access: 'public',
                addRandomSuffix: false, // Keep original filename
              });

              // Update database record
              await prisma.projectImage.update({
                where: { id: existingRecord.id },
                data: { blobUrl: blob.url }
              });

              console.log(`   ✅ Successfully uploaded: ${blob.url}`);
              successCount++;
            } else {
              console.log(`   🔍 Would upload: ${bucket}/${filename}`);
              successCount++;
            }

          } catch (fileError) {
            console.error(`   ❌ Error processing ${filename}:`, fileError.message);
            errorCount++;
          }
        }
      } catch (bucketError) {
        console.error(`❌ Error processing bucket ${bucket}:`, bucketError.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total files processed: ${totalFiles}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    if (DRY_RUN) {
      console.log('\n🔍 This was a dry run. Set DRY_RUN = false to actually migrate files.');
    } else {
      console.log('\n🎉 Migration completed!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to verify migration
async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  const totalImages = await prisma.projectImage.count();
  const migratedImages = await prisma.projectImage.count({
    where: { blobUrl: { not: null } }
  });
  
  console.log(`Total images in database: ${totalImages}`);
  console.log(`Migrated images: ${migratedImages}`);
  console.log(`Remaining to migrate: ${totalImages - migratedImages}`);
  
  if (migratedImages === totalImages) {
    console.log('✅ All images have been migrated!');
  }
  
  await prisma.$disconnect();
}

// Run migration
const command = process.argv[2];

if (command === 'verify') {
  verifyMigration();
} else {
  migrateImages();
}