"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import TourForm from "@/components/tours/TourForm";
import { mockTours } from "@/app/data/mockTours";
import { useParams } from "next/navigation";

export default function EditTourPage() {
  const { id } = useParams<{ id: string }>();
  const tour = mockTours.find((t) => t.id === id);
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
        <TourForm mode="edit" initialData={tour} />
      </SidebarInset>
    </SidebarProvider>
  );
}
