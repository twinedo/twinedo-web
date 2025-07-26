// verify-migration.js
import { prisma } from './src/backend/prisma/client'

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...\n');

  try {
    // Check if blobUrl field exists
    const images = await prisma.projectImage.findMany({
      take: 5,
      select: {
        id: true,
        bucket: true,
        filename: true,
        blobUrl: true, // This might cause error if field doesn't exist
      }
    });

    console.log('✅ blobUrl field exists in database');
    
    // Count total images
    const totalImages = await prisma.projectImage.count();
    console.log(`📊 Total images in database: ${totalImages}`);

    // Count images with blobUrl
    const migratedImages = await prisma.projectImage.count({
      where: {
        blobUrl: {
          not: null
        }
      }
    });
    console.log(`✅ Images with blobUrl: ${migratedImages}`);
    console.log(`❌ Images without blobUrl: ${totalImages - migratedImages}`);

    // Show sample data
    console.log('\n📋 Sample records:');
    images.forEach((img, index) => {
      console.log(`${index + 1}. ${img.filename}`);
      console.log(`   blobUrl: ${img.blobUrl ? '✅ HAS URL' : '❌ NULL'}`);
      if (img.blobUrl) {
        console.log(`   URL: ${img.blobUrl.substring(0, 50)}...`);
      }
    });

    // Check if any blob URLs exist at all
    const hasAnyBlobs = await prisma.projectImage.findFirst({
      where: {
        blobUrl: {
          not: null
        }
      }
    });

    if (!hasAnyBlobs) {
      console.log('\n❗ NO IMAGES HAVE BLOB URLS - Migration didn\'t save to database');
    }

  } catch (error) {
    if (error.message.includes('blobUrl')) {
      console.log('❌ blobUrl field does NOT exist in database schema');
      console.log('You need to add it to your Prisma schema and run migration');
    } else {
      console.log('❌ Error checking migration:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationStatus();