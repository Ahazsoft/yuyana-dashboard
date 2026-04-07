// import fs from "fs";
// import path from "path";
// import { uuid } from "uuidv4";

// const jsonPath = path.join(process.cwd(), "data/tours.json");

// async function preprocessTours() {
//   try {
//     const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
//     const updatedData = data.map((tour: any) => ({
//       id: tour.id || uuid(),
//       ...tour,
//       createdAt: tour.createdAt || new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     }));

//     fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2));
//     console.log("Tour data pre-processed successfully with UUIDs.");
//   } catch (error) {
//     console.error("Error pre-processing tours:", error);
//     process.exit(1);
//   }
// }

// preprocessTours();
