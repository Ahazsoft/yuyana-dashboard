import { prisma } from './lib/prisma';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const count = await prisma.tourPackage.count();
    console.log('Number of tour packages in DB:', count);
    
    // Try to fetch a few records
    const tours = await prisma.tourPackage.findMany({
      take: 2,
      select: { id: true, tourTitle: true }
    });
    console.log('Sample tours:', tours);
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.();
  }
}

testConnection();
