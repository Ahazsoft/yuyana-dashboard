// // app/api/tours/add/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma"; // adjust path to your prisma instance
// import { Prisma } from "@prisma/client";



// // Define expected shape of request body
// interface TourPlanDayInput {
//   dayNumber: number;
//   title?: string;
//   description?: string;
//   items?: string[];
//   boldtext?: string;
// }

// interface TourPackageInput {
//   slugUrl: string;
//   tourTitle: string;
//   tourDestination: string;
//   imageUrl?: string | null;
//   tourDescription?: string | null;
//   tourDuration?: number | null;
//   tourPrice?: any; // JSON value (object or primitive)
//   tourRating?: number | null;
//   included?: string[];
//   excluded?: string[];
//   tourDocumentUrl?: string | null;
//   tourPlanDays: TourPlanDayInput[]; // at least one required
// }

// export async function POST(request: Request) {
//   try {
//     const body: TourPackageInput = await request.json();

//     // --- Basic validation ---
//     if (!body.slugUrl || !body.tourTitle || !body.tourDestination) {
//       return NextResponse.json(
//         {
//           error: "Missing required fields: slugUrl, tourTitle, tourDestination",
//         },
//         { status: 400 },
//       );
//     }

    

//     // Validate each day has a dayNumber
//     for (const day of body.tourPlanDays) {
//       if (day.dayNumber === undefined || day.dayNumber === null) {
//         return NextResponse.json(
//           { error: "Each tour plan day must have a dayNumber" },
//           { status: 400 },
//         );
//       }
//     }

//     // --- Create tour package with nested plan days ---
//     const newTour = await prisma.tourPackage.create({
//       data: {
//         slugUrl: body.slugUrl,
//         tourTitle: body.tourTitle,
//         tourDestination: body.tourDestination,
//         imageUrl: body.imageUrl ?? null,
//         tourDescription: body.tourDescription ?? null,
//         tourDuration: body.tourDuration ?? null,
//         tourPrice: body.tourPrice ?? Prisma.DbNull,
//         included: body.included ?? [],
//         excluded: body.excluded ?? [],
//         tourDocumentUrl: body.tourDocumentUrl ?? null,

//         tourPlanDays: {
//           create: body.tourPlanDays.map((day) => ({
//             dayNumber: day.dayNumber,
//             title: day.title ?? null,
//             description: day.description ?? null,
//             items: day.items ?? [],
//             boldtext: day.boldtext ?? null,
//           })),
//         },
//       },
//       // Include the created days in the response
//       include: {
//         tourPlanDays: {
//           orderBy: { dayNumber: "asc" },
//         },
//       },
//     });

//     return NextResponse.json(newTour, { status: 201 });
//   } catch (error) {
//     console.error("Error creating tour:", error);

//     // Handle Prisma unique constraint error (e.g., duplicate slugUrl)
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === "P2002") {
//         return NextResponse.json(
//           { error: "A tour with this slug already exists" },
//           { status: 409 },
//         );
//       }
//     }

//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
// import fs from 'fs/promises';
import path from 'path';
import {prisma} from '@/lib/prisma';

// Helper to ensure directory exists
// async function ensureDir(dir: string) {
//   try {
//     await mkdir(dir, { recursive: true });
//   } catch (err) {
//     // directory already exists
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();

//     // --- Extract text fields ---
//     const slugUrl = formData.get('slugUrl') as string;
//     const tourTitle = formData.get('tourTitle') as string;
//     const tourDestination = formData.get('tourDestination') as string;
//     const tourDescription = formData.get('tourDescription') as string | null;
//     const tourDuration = formData.get('tourDuration') ? Number(formData.get('tourDuration')) : null;
//     const included = formData.get('included') ? JSON.parse(formData.get('included') as string) : [];
//     const excluded = formData.get('excluded') ? JSON.parse(formData.get('excluded') as string) : [];
//     const tourPrice = formData.get('tourPrice') ? JSON.parse(formData.get('tourPrice') as string) : null;
//     const tourPlanDays = formData.get('tourPlanDays') ? JSON.parse(formData.get('tourPlanDays') as string) : [];

//     // --- Validate required fields ---
//     if (!slugUrl || !tourTitle || !tourDestination) {
//       return NextResponse.json(
//         { error: 'Missing required fields: slugUrl, tourTitle, tourDestination' },
//         { status: 400 }
//       );
//     }

  

//     // --- Handle file uploads ---
//     const imageFile = formData.get('image') as File | null;
//     const documentFile = formData.get('document') as File | null;

//     // Define upload directories
//     const imagesDir = path.join(process.cwd(), 'public/images');
//     const documentsDir = path.join(process.cwd(), 'public/documents');
//     await ensureDir(imagesDir);
//     await ensureDir(documentsDir);

//     let imageUrl: string | null = null;
//     let tourDocumentUrl: string | null = null;

//     if (imageFile) {
//       const bytes = await imageFile.arrayBuffer();
//       const buffer = Buffer.from(bytes);
//       // Generate unique filename to avoid collisions
//       const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
//       const filePath = path.join(imagesDir, fileName);
//       await writeFile(filePath, buffer);
//       imageUrl = `/images/${fileName}`; // relative URL to store in DB
//     }

//     if (documentFile) {
//       const bytes = await documentFile.arrayBuffer();
//       const buffer = Buffer.from(bytes);
//       const fileName = `${Date.now()}-${documentFile.name.replace(/\s/g, '_')}`;
//       const filePath = path.join(documentsDir, fileName);
//       await writeFile(filePath, buffer);
//       tourDocumentUrl = `/documents/${fileName}`;
//     }

//     // --- Create tour in database ---
//     const newTour = await prisma.tourPackage.create({
//       data: {
//         slugUrl,
//         tourTitle,
//         tourDestination,
//         imageUrl,
//         tourDescription,
//         tourDuration,
//         tourPrice: tourPrice ?? Prisma.DbNull,
//         included,
//         excluded,
//         tourDocumentUrl,
//         tourPlanDays: {
//           create: tourPlanDays.map((day: any) => ({
//             dayNumber: day.dayNumber,
//             title: day.title ?? null,
//             description: day.description ?? null,
//             items: day.items ?? [],
//             boldtext: day.boldtext ?? null,
//           })),
//         },
//       },
//       include: {
//         tourPlanDays: {
//           orderBy: { dayNumber: 'asc' },
//         },
//       },
//     });

//     return NextResponse.json(newTour, { status: 201 });
//   } catch (error) {
//     console.error('Error creating tour:', error);

//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === 'P2002') {
//         return NextResponse.json(
//           { error: 'A tour with this slug already exists' },
//           { status: 409 }
//         );
//       }
//     }

//     // Handle JSON parse errors
//     if (error instanceof SyntaxError) {
//       return NextResponse.json(
//         { error: 'Invalid JSON format in one of the fields' },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from "next/server";
// import fs from "fs/promises";
// import path from "path";

export async function POST(request: Request) {
  try {
    // For now, this will just simulate adding a tour to the JSON file
    // In a real implementation, you would save the tour data to your database
    
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
    
    // Get image and document files if provided
    const imageFile = formData.get("image") as File | null;
    const documentFile = formData.get("document") as File | null;
    
    // For now, just return a success response
    // In a real implementation, you would save this data to your database
    return NextResponse.json({
      success: true,
      message: "Tour created successfully!",
      tour: {
        id: slugUrl,
        title: tourTitle,
        destination: tourDestination,
        description: tourDescription,
        duration: tourDuration,
        price: tourPrice,
        included,
        excluded,
        tourPlanDays,
        isPublished: true,
        slugUrl,
        // For image and document, we would typically upload them to storage
        // and return the URLs here
        imageUrl: imageFile ? `/images/${imageFile.name}` : null,
        tourDocumentUrl: documentFile ? `/documents/${documentFile.name}` : null
      }
    });
  } catch (error) {
    console.error("Error creating tour:", error);
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}
