#!/usr/bin/env node

/**
 * Database setup script for Yuyana Dashboard
 * 
 * This script helps initialize the PostgreSQL database for the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Yuyana Dashboard Database Setup Script\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found in current directory!');
  console.error('💡 Make sure to run this script from the yuyana-dashboard directory');
  process.exit(1);
}

async function setupDatabase() {
  try {
    // Check if DATABASE_URL is set
    const dotenv = require('dotenv');
    // Load .env first, then .env.local will override it if present natively or we read both
    const envShared = dotenv.config({ path: '.env' }).parsed || {};
    const envLocal = dotenv.config({ path: '.env.local' }).parsed || {};
    const DATABASE_URL = process.env.DATABASE_URL || envLocal.DATABASE_URL || envShared.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not found!');
      console.log('\n📝 Please set DATABASE_URL in your .env.local file:');
      console.log('   DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"\n');
      process.exit(1);
    }
    
    console.log(`✅ Using database: ${DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);

    // Check if Prisma is installed
    console.log('📦 Checking if Prisma CLI is available...');
    execSync('npx prisma --version', { stdio: 'pipe' });
    console.log('✅ Prisma CLI is available\n');

    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    // Run database migrations
    console.log('🚚 Running database migrations...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database migrations completed\n');

    // Seed the database
    console.log('🌱 Seeding database with initial data...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeded with initial data\n');

    // Verify the admin user exists
    console.log('🔍 Verifying admin user exists...');
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    // Use async/await with pg pool
    const result = await new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, email, role FROM "User" WHERE email = $1', 
        ['admin@yuyana.com'],
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
    });
    
    if (result.rows.length === 0) {
      console.log('👤 Creating admin user...');
      
      // Hash the default password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      await new Promise((resolve, reject) => {
        pool.query(`
          INSERT INTO "User" (id, email, name, password, role, active, emailVerified) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          '00000000-0000-0000-0000-000000000001', 
          'admin@yuyana.com', 
          'Admin User', 
          hashedPassword, 
          'ADMIN', 
          true,
          new Date()
        ], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
      
      console.log('✅ Admin user created with credentials:');
      console.log('   Email: admin@yuyana.com');
      console.log('   Password: admin123456');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    await pool.end();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🚀 You can now start the application with:');
    console.log('   pnpm dev');
    console.log('\n🔐 Default admin login:');
    console.log('   Email: admin@yuyana.com');
    console.log('   Password: admin123456');
    
  } catch (error) {
    console.error('❌ Error during database setup:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🚨 Database connection failed! Possible causes:');
      console.error('   1. PostgreSQL server is not running');
      console.error('   2. Incorrect host/port in DATABASE_URL');
      console.error('   3. PostgreSQL is not installed');
      
      console.log('\n🔧 To start PostgreSQL:');
      console.log('   On macOS (with Homebrew): brew services start postgresql');
      console.log('   On Ubuntu/Debian: sudo systemctl start postgresql');
      console.log('   On Windows: Start the PostgreSQL service from Services app');
    }
    
    if (error.stdout) {
      console.error(error.stdout?.toString());
    }
    
    if (error.stderr) {
      console.error(error.stderr?.toString());
    }
    
    process.exit(1);
  }
}

setupDatabase();