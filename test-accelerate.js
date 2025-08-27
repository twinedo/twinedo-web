// Test Prisma Accelerate connection
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

// Use your exact DATABASE_URL from .env
const DATABASE_URL = "prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19WanJYUGdJeVRvLU1hUlNhUTJLRzAiLCJhcGlfa2V5IjoiMDFLMEYwOU1UQUI1R0JHRE5GMDdQTUY2VzMiLCJ0ZW5hbnRfaWQiOiJmYjY2NjgyYWMyZDUxMjcwNjBhZjQ3YzdiZWMwZDJmZDgxYzhhNTllNDU4Y2ZmMTE3NTRjZDRmZTExODBkZTRlIiwiaW50ZXJuYWxfc2VjcmV0IjoiYzhmZGViMzEtZTBiNi00NWYyLWJlYmQtYTRmOTg5ZTlmOTVjIn0.y63jJWtoGkVA2uOHAlUm-QtwDctRYfmdsV3NB-yJP3E";

async function testAccelerate() {
  const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
  }).$extends(withAccelerate());

  try {
    console.log('Testing Prisma Accelerate connection...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic connection successful:', result);
    
    // Test a simple query if possible
    try {
      const count = await prisma.projectImage.count();
      console.log('✅ ProjectImage table accessible, count:', count);
    } catch (e) {
      console.log('⚠️  ProjectImage table access:', e.message);
    }
    
    console.log('🎉 Prisma Accelerate is working!');
    
  } catch (error) {
    console.error('❌ Prisma Accelerate connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('unauthorized')) {
      console.log('💡 Suggestion: Check your API key in the DATABASE_URL');
    } else if (error.message.includes('not found')) {
      console.log('💡 Suggestion: Check if your Accelerate instance is active');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAccelerate();