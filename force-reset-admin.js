const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await hash("admin123456", 12);
    const user = await prisma.user.update({
      where: { email: "admin@yuyana.com" },
      data: {
        password: hashedPassword,
        failedLoginCount: 0,
        lockedUntil: null,
        active: true
      },
    });
    console.log("Admin password successfully reset to 'admin123456' for:", user.email);
  } catch (err) {
    console.error("Failed to reset admin password:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
