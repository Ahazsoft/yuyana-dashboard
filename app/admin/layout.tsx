import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}