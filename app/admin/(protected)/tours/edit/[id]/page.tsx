"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import EditTourForm from "@/components/tours/EditTourForm";
import { useEffect, useState } from "react";

export default function EditTourPage() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tours/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setTour(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tour) return <div>Tour not found</div>;

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <EditTourForm initialData={tour} />
      </SidebarInset>
    </SidebarProvider>
  );
}

// "use client";

// import { AppSidebar } from "@/components/app-sidebar";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import { mockTours } from "@/app/data/mockTours";
// import { useParams } from "next/navigation";
// import EditTourForm from "@/components/tours/EditTourForm";

// export default function EditTourPage() {
//   const { id } = useParams<{ id: string }>();
//   const tour = mockTours.find((t) => t.id === id);
//   return (
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "calc(var(--spacing) * 72)",
//           "--header-height": "calc(var(--spacing) * 12)",
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <EditTourForm initialData={tour!} />
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }
