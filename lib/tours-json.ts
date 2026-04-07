import fs from "fs";
import path from "path";
import { uuid } from "uuidv4";

const DATA_PATH = path.join(process.cwd(), "data/tours.json");

export interface TourPackage {
  id: string;
  slugUrl: string;
  tourTitle: string;
  tourDescription?: string | null;
  tourDestination: string;
  tourDuration?: number | null;
  tourPrice?: any | null;
  imageUrl?: string | null;
  isPublished: boolean;
  included: string[];
  excluded: string[];
  tourDocumentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  tourPlanDays?: any[];
}

export class TourJSONRepository {
  private static readData(): TourPackage[] {
    try {
      const content = fs.readFileSync(DATA_PATH, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Error reading tours data from JSON:", error);
      return [];
    }
  }

  private static writeData(data: TourPackage[]): void {
    const tempPath = `${DATA_PATH}.tmp`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, DATA_PATH);
    } catch (error) {
      console.error("Error writing tours data to JSON:", error);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  static getAll(): TourPackage[] {
    return this.readData();
  }

  static getById(id: string): TourPackage | null {
    const tours = this.readData();
    return tours.find((t) => t.id === id) || null;
  }

  static getBySlug(slug: string): TourPackage | null {
    const tours = this.readData();
    return tours.find((t) => t.slugUrl === slug) || null;
  }

  static create(data: Partial<TourPackage>): TourPackage {
    const tours = this.readData();
    const newTour: TourPackage = {
      id: uuid(),
      slugUrl: data.slugUrl || "",
      tourTitle: data.tourTitle || "New Tour",
      tourDescription: data.tourDescription || null,
      tourDestination: data.tourDestination || "Ethiopia",
      tourDuration: data.tourDuration || null,
      tourPrice: data.tourPrice || null,
      imageUrl: data.imageUrl || null,
      isPublished: data.isPublished ?? false,
      included: data.included || [],
      excluded: data.excluded || [],
      tourDocumentUrl: data.tourDocumentUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tourPlanDays: data.tourPlanDays || [],
    };
    tours.unshift(newTour);
    this.writeData(tours);
    return newTour;
  }

  static update(id: string, data: Partial<TourPackage>): TourPackage | null {
    const tours = this.readData();
    const index = tours.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updatedTour = {
      ...tours[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    tours[index] = updatedTour;
    this.writeData(tours);
    return updatedTour;
  }

  static delete(id: string): boolean {
    const tours = this.readData();
    const initialLength = tours.length;
    const filteredTours = tours.filter((t) => t.id !== id);
    if (filteredTours.length === initialLength) return false;

    this.writeData(filteredTours);
    return true;
  }
}
