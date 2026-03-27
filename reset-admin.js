const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.update({
      where: { email: "admin@yuyana.com" },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
    console.log("Admin account reset successfully:", user.email);
  } catch (err) {
    console.error("Failed to reset admin account:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
