import { hash } from "bcryptjs";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

async function main() {
  // Set up PostgreSQL connection pool and Prisma adapter
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter }) as any;

  console.log("🌱 Seeding database...");

  // 1. Create default Admin user
  const adminEmail = "admin@yuyana.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hash("admin123456", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "System Administrator",
        password: hashedPassword,
        role: "ADMIN",
        active: true,
      },
    });
    console.log("✅ Created default admin user: admin@yuyana.com / admin123456");
  } else {
    console.log("ℹ️ Admin user already exists, skipping...");
  }

  // 2. Sample Tour Packages (if none exist)
  // const tourCount = await prisma.tourPackage.count();
  // if (tourCount === 0) {
  //   await prisma.tourPackage.create({
  //     data: {
  //       tourTitle: "Simien Mountains Trekking",
  //       slugUrl: "simien-mountains-trekking",
  //       tourDestination: "Ethiopia",
  //       tourDescription: "A breathtaking 5-day trek through the Roof of Africa.",
  //       tourDuration: 5,
  //       isPublished: true,
  //       tourPrice: { amount: 750, currency: "USD" },
  //       included: ["Accommodation", "Guides", "Meals"],
  //       excluded: ["Flights", "Tips"],
  //     },
  //   });
  //   console.log("✅ Created sample tour package.");
  // }

  // console.log("🏁 Seeding complete.");

  // Clean up
  await prisma.$disconnect();
  await pool.end(); // Close the pool when done
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});