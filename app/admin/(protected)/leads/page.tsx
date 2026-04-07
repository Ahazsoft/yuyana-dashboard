"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, TrendingUp, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leads");
        return res.json();
      })
      .then((data) => {
        setLeads(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "WON": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "LOST": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "CONTACTED": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "QUALIFIED": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Leads</h1>
          <p className="text-muted-foreground mt-1">Track and manage your sales pipeline.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Active Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-lg border bg-destructive/10 p-6 text-destructive text-center">
              <p className="font-semibold">Error Loading Leads</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Est. Value</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{l.customer?.name || "—"}</span>
                          <span className="text-xs text-muted-foreground">
                            {l.customer?.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {l.source || "—"}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm font-medium">
                        {l.estimatedValue != null
                          ? `ETB ${l.estimatedValue.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium">{l.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusVariant(l.status)}`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground opacity-30" />
                          <p className="text-muted-foreground">No leads found in pipeline.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {!loading && !error && leads.length > 0 && (
          <CardFooter className="text-sm text-muted-foreground">
            Showing {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
