import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
}).$extends(withAccelerate());

async function testProjectImages() {
  try {
    console.log('Testing ProjectImage table...');
    
    // Test 1: Count total records
    const count = await prisma.projectImage.count();
    console.log(`Total ProjectImage records: ${count}`);
    
    // Test 2: Get all buckets
    const buckets = await prisma.projectImage.groupBy({
      by: ['bucket'],
      _count: { bucket: true }
    });
    console.log('Available buckets:', buckets);
    
    // Test 3: Get sample records
    const samples = await prisma.projectImage.findMany({
      take: 5,
      select: {
        id: true,
        bucket: true,
        filename: true,
        blobUrl: true,
        isFeatured: true
      }
    });
    console.log('Sample records:', samples);
    
    // Test 4: Test colombo bucket specifically
    const colomboImages = await prisma.projectImage.findMany({
      where: { bucket: 'colombo' },
      select: {
        id: true,
        filename: true,
        blobUrl: true,
        isFeatured: true
      }
    });
    console.log('Colombo bucket images:', colomboImages);
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProjectImages();