"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import TourCard from "@/components/tours/TourCard"; // Import the redesigned card

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
  _count?: {
    bookings: number;
  };
}

export default function ToursManagementPage() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

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

  // Apply filters: search + status
  const filtered = tours.filter((t) => {
    const matchesSearch =
      t.tourTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.tourDestination.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && t.isPublished) ||
      (statusFilter === "draft" && !t.isPublished);
    return matchesSearch && matchesStatus;
  });

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

        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tours by title or destination..."
              className="pl-10 h-12 bg-white/80 backdrop-blur-sm border border-slate-200/80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tours</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
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
                : "Try adjusting your search or filter to find what you're looking for."}
            </p>
            {(search || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Reset Filters
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