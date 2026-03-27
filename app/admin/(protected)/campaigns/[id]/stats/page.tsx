"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, BarChart3, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function CampaignStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd have a dedicated stats endpoint
    // For now, we fetch the campaign and its logs directly
    fetch(`/api/campaigns`)
      .then(res => res.json())
      .then(all => {
        const campaign = all.find((c: any) => c.id === id);
        setStats(campaign);
        setLoading(false);
      });

    // We'd also fetch logs here if we had a logs endpoint for campaigns
  }, [id]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if (!stats) return <div className="p-12 text-center">Campaign not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/admin/campaigns">
        <Button variant="ghost" className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </Button>
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">{stats.name}</h1>
          <p className="text-gray-500">Subject: {stats.subject}</p>
        </div>
        <div className="text-right">
           <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
             {stats.status}
           </span>
           <p className="text-xs text-gray-400 mt-1">Sent on {new Date(stats.sentDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Recipients</p>
                <p className="text-2xl font-bold">{stats.recipientCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold">{stats.recipientCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Failed / Bounced</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Context</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded border text-sm">
              <p>The campaign was dispatched via Resend. Deliverability tracking (opens/clicks) will appear here once the Resend webhooks are fully configured in the next phase of implementation.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
