const { prisma } = require("@/lib/prisma");
const fs = require("fs").promises;
const path = require("path");

// const prisma = new PrismaClient();

async function seed() {
  const dataPath = path.join(
    __dirname,
    "..",
    "temp",
    "extracted-tours-structured.json",
  );
  //   const dataPath = path.join(__dirname, "temp/extracted-tours-structured.json");
  const toursData = JSON.parse(await fs.readFile(dataPath, "utf8"));

  for (const tourData of toursData) {
    const { tourPlanDays, ...tourPackage } = tourData;

    const createdTour = await prisma.tourPackage.create({
      data: {
        ...tourPackage,
        tourPlanDays: {
          //@ts-ignore
          create: tourPlanDays.map((day) => ({
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            items: day.items,
            boldtext: day.boldtext,
          })),
        },
      },
    });
    console.log(`Inserted tour: ${createdTour.tourTitle} (${createdTour.id})`);
  }

  console.log("Seeding completed.");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
