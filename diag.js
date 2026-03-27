const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function main() {
  console.log("Starting diagnostic (Driver Adapter)...");
  
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:tiger@localhost:5432/yuyana_db?schema=public";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@yuyana.com" },
    });
    console.log("Admin user found:", user ? "YES" : "NO");
    if (user) {
      console.log("User role:", user.role);
    }
  } catch (err) {
    console.error("Diagnostic failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
