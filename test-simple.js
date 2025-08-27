const { prisma } = require('./src/backend/prisma/client/index.ts');

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
    
    // Test 3: Test colombo bucket specifically
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