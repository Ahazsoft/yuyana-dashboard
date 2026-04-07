"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Clock, Eye } from "lucide-react";

// Type definitions (should match your Prisma schema)
interface TourPlanDay {
  dayNumber: number;
  title: string | null;
  description: string | null;
  items: string[];
  boldtext: string | null;
}

interface TourPackage {
  id: string;
  slugUrl: string;
  imageUrl: string | null;
  tourTitle: string;
  tourDescription: string | null;
  tourDuration: number | null;
  tourDestination: string;
  tourPrice: any;
  isPublished: boolean;
  included: string[];
  excluded: string[];
  tourDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  tourPlanDays: TourPlanDay[];
}

// Simple Tour Card Component (can be moved to separate file)
const TourCard = ({ tour }: { tour: TourPackage }) => {
  const getPriceDisplay = () => {
    if (!tour.tourPrice) return "Contact us";
    if (typeof tour.tourPrice === "number") return `$${tour.tourPrice}`;
    if (tour.tourPrice.price) return `$${tour.tourPrice.price}`;
    if (tour.tourPrice.pricetag) return `$${tour.tourPrice.pricetag}`;
    return "Contact us";
  };

  return (
    <div className="group rounded-xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {tour.imageUrl ? (
          <Image
            src={tour.imageUrl}
            alt={tour.tourTitle}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
        {/* Published badge */}
        <div className="absolute top-2 right-2">
          <div
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              tour.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {tour.isPublished ? "Published" : "Draft"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-1">{tour.tourTitle}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{tour.tourDestination}</span>
          </div>
          {tour.tourDuration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{tour.tourDuration} days</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tour.tourDescription || "No description provided."}
        </p>
        <div className="flex justify-between items-center pt-2">
          <div className="font-bold text-lg">{getPriceDisplay()}</div>
          <Link href={`/admin/tours/edit/${tour.slugUrl}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="w-3.5 h-3.5" />
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function ToursManagementPage() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await fetch("/api/tours");
        if (!res.ok) throw new Error("Failed to fetch tours");
        const data = await res.json();
        setTours(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  // Loading skeleton (grid of cards)
  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="px-6 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your travel packages and experiences.
          </p>
        </div>
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border bg-card shadow-sm overflow-hidden"
              >
                <div className="aspect-[16/9] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                    <div className="h-4 bg-muted rounded animate-pulse w-20" />
                  </div>
                  <div className="h-4 bg-muted rounded animate-pulse w-full" />
                  <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-muted rounded animate-pulse w-24" />
                    <div className="h-8 bg-muted rounded animate-pulse w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-6">
        <div className="px-6 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your travel packages and experiences.
          </p>
        </div>
        <div className="px-6">
          <div className="rounded-lg border bg-destructive/10 p-6 text-destructive">
            <h3 className="font-bold">Error Loading Tours</h3>
            <p>{error}</p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filtered = tours.filter(
    (t) =>
      t.tourTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.tourDestination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-6">
      <div className="px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tours Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your travel packages and experiences.
            </p>
          </div>
          <Link href="/admin/tours/add">
            <Button className="rounded-xl px-6 h-12 font-semibold shadow-lg shadow-primary/20 gap-2">
              <Plus className="w-5 h-5" />
              Add New Tour
            </Button>
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tours by title or destination..."
            className="pl-10 h-12 bg-white/80 backdrop-blur-sm border border-slate-200/80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 pb-10">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold text-lg">No tours found</h3>
            <p className="text-muted-foreground mt-1">
              {tours.length === 0
                ? "No tours in the database yet. Create your first tour using the button above."
                : "Try adjusting your search to find what you're looking for."}
            </p>
            {tours.length > 0 && (
              <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
                Reset Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}