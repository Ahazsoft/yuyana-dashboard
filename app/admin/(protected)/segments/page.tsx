"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, Save } from "lucide-react";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [newSegment, setNewSegment] = useState({
    name: "",
    criteria: {
      country: "",
      leadStatus: "",
      subscriptionStatus: "SUBSCRIBED"
    }
  });

  useEffect(() => {
    fetch("/api/segments")
      .then((res) => res.json())
      .then((data) => {
        setSegments(data || []);
        setLoading(false);
      });
  }, []);

  const handlePreview = async () => {
    const res = await fetch("/api/segments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criteria: newSegment.criteria }),
    });
    const data = await res.json();
    setPreviewCount(data.count);
  };

  const handleSave = async () => {
    if (!newSegment.name) return alert("Name is required");
    
    const res = await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSegment),
    });

    if (res.ok) {
       const saved = await res.json();
       setSegments([saved, ...segments]);
       setNewSegment({ name: "", criteria: { country: "", leadStatus: "", subscriptionStatus: "SUBSCRIBED" } });
       setPreviewCount(null);
       alert("Segment saved!");
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold">Customer Segments</h1>
        <Card>
          <CardHeader>
            <CardTitle>Define New Segment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Segment Name</Label>
              <Input 
                placeholder="e.g. Ethiopian Qualified Leads" 
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input 
                  placeholder="e.g. Ethiopia" 
                  value={newSegment.criteria.country}
                  onChange={(e) => setNewSegment({ 
                    ...newSegment, 
                    criteria: { ...newSegment.criteria, country: e.target.value } 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Status</Label>
                <select 
                  className="w-full p-2 border rounded-md dark:bg-gray-900"
                  value={newSegment.criteria.leadStatus}
                  onChange={(e) => setNewSegment({ 
                    ...newSegment, 
                    criteria: { ...newSegment.criteria, leadStatus: e.target.value } 
                  })}
                >
                  <option value="">Any Status</option>
                  <option value="NEW">New</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="WON">Won</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
               <div className="flex items-center gap-2 text-sm font-medium">
                  {previewCount !== null && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Users className="h-4 w-4" /> {previewCount} potential recipients
                    </span>
                  )}
               </div>
               <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview}>Preview Count</Button>
                <Button onClick={handleSave} className="flex gap-2">
                  <Save className="h-4 w-4" /> Save Segment
                </Button>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Segments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" /> : (
              <ul className="divide-y">
                {segments.map(s => (
                  <li key={s.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{s.name}</h4>
                      <p className="text-xs text-gray-500">
                        {Object.entries(s.criteria).map(([k,v]) => v ? `${k}: ${v}` : '').filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {s._count?.campaigns} campaigns
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-300">Segmentation Help</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 dark:text-blue-200">
            <p>Segments allow you to group customers dynamically. When you send a campaign to a segment, we recalculate the recipients at the moment of sending.</p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Country: Exact match filter</li>
              <li>Lead Status: Filter by current sales pipeline stage</li>
              <li>Subscription: Only SUBSCRIBED users are included by default</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
