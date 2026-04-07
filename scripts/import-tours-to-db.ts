import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import config from "../prisma-runtime.config";

const prisma = new PrismaClient({ adapter: config.adapter });

async function importToursToDatabase() {
  try {
    // Read the extracted tours JSON file from the yuyana-travel directory
    // Using relative path from the current working directory (yuyana-dashboard)
    const jsonPath = path.join(__dirname, "../../yuyana-travel", "extracted-tours.json");
    const jsonData = await fs.readFile(jsonPath, "utf8");
    const tours = JSON.parse(jsonData);

    console.log(`Found ${tours.length} tours to import`);

    // Count existing tours to prevent duplicates by slug
    const existingTours = await prisma.tourPackage.findMany({
      select: { slugUrl: true }
    });
    const existingSlugs = new Set(existingTours.map(tour => tour.slugUrl));

    let importedCount = 0;
    let skippedCount = 0;

    for (const tour of tours) {
      // Skip if tour with this slug already exists
      if (existingSlugs.has(tour.slugUrl)) {
        console.log(`⚠️ Skipping tour with slug "${tour.slugUrl}" - already exists`);
        skippedCount++;
        continue;
      }

      // Process image URL to fix relative paths
      let processedImageUrl = tour.imageUrl;
      if (tour.imageUrl && typeof tour.imageUrl === 'string') {
        // If it's a relative path starting with ../ or ../../, make it relative to public/images
        if (tour.imageUrl.startsWith("..")) {
          // Extract just the filename from the path
          const filename = path.basename(tour.imageUrl);
          processedImageUrl = `/images/${filename}`;
        } else if (tour.imageUrl.startsWith("./") || !tour.imageUrl.startsWith("/")) {
          const filename = path.basename(tour.imageUrl);
          processedImageUrl = `/images/${filename}`;
        }
      }

      // Process document URL if present
      let processedDocUrl = tour.tourDocumentUrl;
      if (tour.tourDocumentUrl && typeof tour.tourDocumentUrl === 'string') {
        if (tour.tourDocumentUrl.startsWith("..")) {
          const filename = path.basename(tour.tourDocumentUrl);
          processedDocUrl = `/documents/${filename}`;
        } else if (tour.tourDocumentUrl.startsWith("./") || !tour.tourDocumentUrl.startsWith("/")) {
          const filename = path.basename(tour.tourDocumentUrl);
          processedDocUrl = `/documents/${filename}`;
        }
      }

      // Pre-process tourPlanDays to ensure dayNumber uniqueness
      const uniqueTourPlanDays: any[] = [];
      const seenDayNumbers = new Set();
      
      if (tour.tourPlanDays) {
        for (const day of tour.tourPlanDays) {
          if (!seenDayNumbers.has(day.dayNumber)) {
            seenDayNumbers.add(day.dayNumber);
            uniqueTourPlanDays.push({
              dayNumber: day.dayNumber,
              title: day.title || null,
              description: day.description || null,
              items: day.items || [],
            });
          }
        }
      }

      // Create tour package in database
      try {
        const createdTour = await prisma.tourPackage.create({
          data: {
            slugUrl: tour.slugUrl,
            tourTitle: tour.tourTitle,
            tourDestination: tour.tourDestination,
            tourDescription: tour.tourDescription || null,
            tourDuration: tour.tourDuration || null,
            tourPrice: tour.tourPrice ? tour.tourPrice : null,
            included: tour.included || [],
            excluded: tour.excluded || [],
            isPublished: tour.isPublished ?? true,
            imageUrl: processedImageUrl || null,
            
            // Create associated tour plan days
            tourPlanDays: {
              create: uniqueTourPlanDays
            }
          },
          include: {
            tourPlanDays: true
          }
        });

        existingSlugs.add(tour.slugUrl);
        console.log(`✅ Successfully imported tour: ${tour.tourTitle}`);
        importedCount++;
      } catch (creationError) {
        console.error(`❌ Error importing tour "${tour.tourTitle}":`, creationError);
        continue;
      }
    }

    console.log(`\nImport completed!`);
    console.log(`✅ Imported: ${importedCount} tours`);
    console.log(`⚠️ Skipped: ${skippedCount} tours`);
  } catch (error) {
    console.error("❌ Error during tour import:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import if this script is called directly
if (require.main === module) {
  importToursToDatabase()
    .then(() => console.log('Tour import process completed successfully!'))
    .catch(err => {
      console.error('Tour import process failed:', err);
      process.exit(1);
    });
}