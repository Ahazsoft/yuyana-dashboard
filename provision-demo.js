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
    const roles = [
      { email: "marketing@yuyana.com", password: "marketing123456", role: "MARKETING", name: "Marketing Manager" },
      { email: "sales@yuyana.com", password: "sales123456", role: "SALES", name: "Sales Agent" }
    ];

    for (const u of roles) {
      const hashedPassword = await hash(u.password, 12);
      await prisma.user.upsert({
        where: { email: u.email },
        update: { password: hashedPassword, role: u.role, active: true },
        create: {
          email: u.email,
          name: u.name,
          password: hashedPassword,
          role: u.role,
          active: true
        }
      });
      console.log(`User ${u.email} provisioned with role ${u.role}`);
    }
  } catch (err) {
    console.error("Provisioning failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
