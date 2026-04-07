"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TourCard from "@/components/tours/TourCard";

interface ApiTour {
  id: string;
  tourTitle: string;
  tourDestination: string;
  tourDuration: number | null;
  tourPrice: any;
  tourDescription: string | null;
  imageUrl: string | null;
  included: string[];
  excluded: string[];
  isPublished: boolean;
  slugUrl: string;
  _count?: {
    bookings: number;
  };
}

export default function ToursPage() {
  const [search, setSearch] = useState("");
  const [tours, setTours] = useState<ApiTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch("/api/tours");
        if (!res.ok) throw new Error("Failed to fetch tours");
        const data = await res.json();
        setTours(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="px-6 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
          <p className="text-muted-foreground mt-1">Manage your travel packages and experiences.</p>
        </div>
        <div className="px-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="mt-4 text-lg font-medium">Loading tours...</p>
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
          <p className="text-muted-foreground mt-1">Manage your travel packages and experiences.</p>
        </div>
        <div className="px-6">
          <div className="rounded-lg border bg-destructive/10 p-6 text-destructive">
            <h3 className="font-bold">Error Loading Tours</h3>
            <p>{error}</p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => window.location.reload()}>
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
            <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
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
                ? "No tours in the database yet. Import tours from Yuyana Travel to get started."
                : "Try adjusting your search to find what you're looking for."}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
              Reset Search
            </Button>
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
