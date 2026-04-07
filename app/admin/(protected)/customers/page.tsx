"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Users, Search } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch customers");
        return res.json();
      })
      .then((data) => {
        setCustomers(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-lg border bg-destructive/10 p-6 text-destructive text-center">
              <p className="font-semibold">Error Loading Customers</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {getInitials(c.name)}
                          </div>
                          <span className="font-medium text-foreground">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {c.email}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {c.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {c._count?.bookings ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground opacity-30" />
                          <p className="text-muted-foreground">
                            No customers found.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {!loading && !error && customers.length > 0 && (
          <CardFooter className="text-sm text-muted-foreground">
            Showing {customers.length} customer
            {customers.length !== 1 ? "s" : ""}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
