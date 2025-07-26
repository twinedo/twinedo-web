// fix-migration.js - Re-run migration properly
import { put } from '@vercel/blob';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from './src/backend/prisma/client'

const UPLOADS_DIR = 'src/backend/src/uploads/projects';
const DRY_RUN = false; // Set to false to actually run

async function fixMigration() {
  console.log('🔧 Fixing image migration...');
  console.log(`📂 Source directory: ${UPLOADS_DIR}`);
  console.log(`🔄 Dry run mode: ${DRY_RUN}`);
  console.log('');

  try {
    if (!existsSync(UPLOADS_DIR)) {
      console.error(`❌ Upload directory not found: ${UPLOADS_DIR}`);
      return;
    }

    const buckets = await readdir(UPLOADS_DIR);
    console.log(`📁 Found ${buckets.length} buckets: ${buckets.join(', ')}`);
    console.log('');

    let totalProcessed = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const bucket of buckets) {
      const bucketPath = join(UPLOADS_DIR, bucket);
      
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
          totalProcessed++;

          try {
            // Find database record
            const existingRecord = await prisma.projectImage.findFirst({
              where: { bucket, filename }
            });

            if (!existingRecord) {
              console.log(`   ⚠️  No database record found for ${filename}`);
              continue;
            }

            // Check if already has blobUrl
            if (existingRecord.blobUrl) {
              console.log(`   ✅ ${filename} already has blobUrl`);
              successCount++;
              continue;
            }

            console.log(`   📤 Uploading ${filename} to blob storage...`);

            if (!DRY_RUN) {
              // Read and upload file
              const fileBuffer = await readFile(filePath);
              const blobPath = `${bucket}/${filename}`;
              
              const blob = await put(blobPath, fileBuffer, {
                access: 'public',
                addRandomSuffix: false,
              });

              // UPDATE DATABASE with blob URL
              await prisma.projectImage.update({
                where: { id: existingRecord.id },
                data: { 
                  blobUrl: blob.url 
                }
              });

              console.log(`   ✅ SUCCESS: ${filename}`);
              console.log(`      Database ID: ${existingRecord.id}`);
              console.log(`      Blob URL: ${blob.url}`);
              successCount++;
            } else {
              console.log(`   🔍 Would upload and update: ${bucket}/${filename}`);
              successCount++;
            }

          } catch (fileError) {
            console.error(`   ❌ Error processing ${filename}:`, fileError.message);
            errorCount++;
          }

          // Small delay to avoid rate limits
          if (!DRY_RUN) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (bucketError) {
        console.error(`❌ Error processing bucket ${bucket}:`, bucketError.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Fix Summary:');
    console.log(`   Total files processed: ${totalProcessed}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    if (DRY_RUN) {
      console.log('\n🔍 This was a dry run. Set DRY_RUN = false to actually migrate files.');
    } else {
      console.log('\n🎉 Migration fix completed!');
      
      // Verify the fix
      const totalImages = await prisma.projectImage.count();
      const migratedImages = await prisma.projectImage.count({
        where: { blobUrl: { not: null } }
      });
      
      console.log(`\n✅ Verification:`);
      console.log(`   Total images: ${totalImages}`);
      console.log(`   With blobUrl: ${migratedImages}`);
      console.log(`   Still missing: ${totalImages - migratedImages}`);
    }

  } catch (error) {
    console.error('❌ Migration fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();