"use client";

import { useParams } from "next/navigation";
import EditTourForm from "@/components/tours/EditTourForm";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function EditTourPage() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the tour using the ID (UUID) from the URL
    fetch(`/api/tours/edit/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Tour not found");
        return res.json();
      })
      .then((data) => {
        setTour(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tour data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-destructive/10 p-6 text-destructive">
          <h3 className="font-bold">Error Loading Tour</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-destructive text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Tour not found.</p>
      </div>
    );
  }

  return <EditTourForm initialData={tour} />;
}