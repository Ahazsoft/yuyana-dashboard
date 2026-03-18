"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { mockTours } from "@/app/data/mockTours";
import TourCard from "@/components/tours/TourCard";


interface Tour {
  id: string;
  tourTitle: string;
  tourDestination: string;
  imageUrl:string;
  tourDuration: number;
  tourPrice:any;
  ratings: any;
}

export default function ToursPage() {
  const [search, setSearch] = useState("");

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch("/api/tours");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTours(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) return <div>Loading tours...</div>;
  if (error) return <div>Error: {error}</div>;

  const filtered = tours.filter(
    (t) =>
      t.tourTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.tourDestination.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header with title and add button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Tour Packages
              </h1>
              <p className="text-sm text-muted-foreground">
                {tours.length} tours available
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/tours/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Tour
              </Link>
            </Button>
          </div>

          {/* Search input */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tour cards grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No tours found.
            </p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
