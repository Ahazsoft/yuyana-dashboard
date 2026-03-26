const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { compare } = require("bcryptjs");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({ where: { email: "admin@yuyana.com" } });
    if (!user) {
      console.log("Admin user not found!");
      return;
    }
    const valid = await compare("admin123456", user.password);
    console.log("Password 'admin123456' is valid for admin:", valid ? "YES" : "NO");
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
