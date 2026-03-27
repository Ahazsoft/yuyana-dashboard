"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    segmentId: "",
  });

  useEffect(() => {
    fetch("/api/segments")
      .then((res) => res.json())
      .then((data) => setSegments(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/campaigns");
      } else {
        const error = await res.json();
        alert(`Error: ${JSON.stringify(error.error)}`);
      }
    } catch (err) {
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/admin/campaigns">
        <Button variant="ghost" className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Reference Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Summer Sale 2024" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject Line</Label>
              <Input 
                id="subject" 
                placeholder="What recipients will see in their inbox" 
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment">Target Segment</Label>
              <select 
                id="segment"
                className="w-full p-2 border rounded-md dark:bg-gray-900"
                value={formData.segmentId}
                onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
              >
                <option value="">Select a segment (Optional)</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Email Content (HTML supported)</Label>
              <Textarea 
                id="content" 
                placeholder="<h1>Hello!</h1><p>Our summer sale is here...</p>" 
                className="min-h-[300px] font-mono"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required 
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Campaign Draft
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
