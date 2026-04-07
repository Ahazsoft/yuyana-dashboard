import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    // Extract the ID from the URL if present
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Read the extracted tours JSON file from the yuyana-travel directory
    const jsonPath = path.join(process.cwd(), "..", "yuyana-travel", "extracted-tours.json");
    const jsonData = await fs.readFile(jsonPath, "utf8");
    const tours = JSON.parse(jsonData);

    // Transform the tours to match the expected format
    const transformedTours = tours.map((tour: any) => {
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

      return {
        id: tour.slugUrl,
        title: tour.tourTitle,
        description: tour.tourDescription || 'No description available',
        price: tour.tourPrice || 0,
        duration: `${tour.tourDuration} days`,
        location: tour.tourDestination,
        image: processedImageUrl || "/placeholder-image.jpg",
        rating: tour.tourRating || 4.5,
        reviewsCount: tour.reviewsCount || 0,
        included: tour.included || [],
        excluded: tour.excluded || [],
        isPublished: tour.isPublished,
        slugUrl: tour.slugUrl,
        tags: tour.tags || [],
        tourDocumentUrl: tour.tourDocumentUrl || null,
        tourPlanDays: tour.tourPlanDays || []
      };
    });

    // If an ID was provided, return just that tour
    if (id) {
      const tour = transformedTours.find((tour: any) => tour.id === id);
      if (!tour) {
        return NextResponse.json(
          { error: "Tour not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(tour);
    }

    // Otherwise return all tours
    return NextResponse.json(transformedTours);
  } catch (error) {
    console.error("Error reading tours JSON:", error);
    return NextResponse.json(
      { error: "Failed to load tours" },
      { status: 500 }
    );
  }
}