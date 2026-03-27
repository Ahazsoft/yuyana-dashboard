"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Leads</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3">Lead Title</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Est. Value</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="px-6 py-4 font-medium">{l.title || "Inquiry from " + l.customer?.firstName}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{l.customer?.firstName} {l.customer?.lastName}</span>
                          <span className="text-xs text-muted-foreground">{l.customer?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{l.currency} {l.value.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          l.status === 'NEW' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          l.status === 'WON' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          l.status === 'LOST' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-secondary text-secondary-foreground'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No leads found in pipeline.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => setShowForm(true)}>Add Lead</Button>
        </CardFooter>
      </Card>
      {showForm && <LeadForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
