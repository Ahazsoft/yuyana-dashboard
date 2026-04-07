import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = params.then(p => p.id);
    const resolvedId = await id;
    
    // For now, just return a success response
    // In a real implementation, you would update your tour database
    return NextResponse.json({
      success: true,
      message: `Tour with ID ${resolvedId} updated successfully! (This is a simulation)`,
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = params.then(p => p.id);
    const resolvedId = await id;
    
    // Parse form data
    const formData = await request.formData();
    
    const slugUrl = formData.get("slugUrl") as string;
    const tourTitle = formData.get("tourTitle") as string;
    const tourDestination = formData.get("tourDestination") as string;
    const tourDescription = formData.get("tourDescription") as string;
    const tourDuration = parseInt(formData.get("tourDuration") as string) || 1;
    const included = JSON.parse(formData.get("included") as string) || [];
    const excluded = JSON.parse(formData.get("excluded") as string) || [];
    const tourPrice = JSON.parse(formData.get("tourPrice") as string);
    const tourPlanDays = JSON.parse(formData.get("tourPlanDays") as string) || [];
    const isPublished = formData.get("isPublished") === "true";
    
    // Get image and document files if provided
    const imageFile = formData.get("image") as File | null;
    const documentFile = formData.get("document") as File | null;
    
    // For now, just return a success response
    // In a real implementation, you would save this data to your database
    return NextResponse.json({
      success: true,
      message: `Tour with ID ${resolvedId} updated successfully!`,
      tour: {
        id: resolvedId,
        slugUrl,
        title: tourTitle,
        destination: tourDestination,
        description: tourDescription,
        duration: tourDuration,
        price: tourPrice,
        included,
        excluded,
        tourPlanDays,
        isPublished,
        // For image and document, we would typically upload them to storage
        // and return the URLs here
        imageUrl: imageFile ? `/images/${imageFile.name}` : null,
        tourDocumentUrl: documentFile ? `/documents/${documentFile.name}` : null
      }
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}
