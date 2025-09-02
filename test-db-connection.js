// Simple script to test database connection
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  
  // Check environment variables
  console.log('VERCEL:', process.env.VERCEL);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DIRECT_DATABASE_URL exists:', !!process.env.DIRECT_DATABASE_URL);
  
  if (process.env.VERCEL === '1' && process.env.DIRECT_DATABASE_URL) {
    console.log('Using direct database connection for Vercel');
    // Test direct connection
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: { db: { url: process.env.DIRECT_DATABASE_URL } },
    });
    
    try {
      await prisma.$connect();
      console.log('Direct database connection successful');
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1`;
      console.log('Query result:', result);
    } catch (error) {
      console.error('Direct database connection failed:', error.message);
    } finally {
      await prisma.$disconnect();
    }
  } else if (process.env.DATABASE_URL) {
    console.log('Using Accelerate connection');
    // Test Accelerate connection
    const { PrismaClient } = require('@prisma/client');
    const { withAccelerate } = require('@prisma/extension-accelerate');
    
    const prisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    }).$extends(withAccelerate());
    
    try {
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1`;
      console.log('Accelerate query result:', result);
      console.log('Accelerate connection successful');
    } catch (error) {
      console.error('Accelerate connection failed:', error.message);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log('No database URL found');
  }
}

testConnection().catch(console.error);