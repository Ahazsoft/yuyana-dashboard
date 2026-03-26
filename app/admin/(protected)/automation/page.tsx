"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Zap, Save, Trash2 } from "lucide-react";

export default function AutomationPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "lead.created",
    emailSubject: "",
    emailTemplateId: "default",
    active: true,
  });

  useEffect(() => {
    fetch("/api/automation-rules")
      .then((res) => res.json())
      .then((data) => {
        setRules(data || []);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!newRule.name || !newRule.emailSubject) return alert("Required fields missing");
    
    const res = await fetch("/api/automation-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRule),
    });

    if (res.ok) {
       const saved = await res.json();
       setRules([saved, ...rules]);
       setNewRule({ name: "", trigger: "lead.created", emailSubject: "", emailTemplateId: "default", active: true });
       alert("Automation rule saved!");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" />
        <h1 className="text-3xl font-bold">Automation Engine</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input 
                placeholder="e.g. Welcome Email for New Leads" 
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <select 
                className="w-full p-2 border rounded-md dark:bg-gray-900 text-sm"
                value={newRule.trigger}
                onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })}
              >
                <option value="lead.created">New Lead Created</option>
                <option value="booking.confirmed">Booking Confirmed</option>
                <option value="trip.completed">Trip Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input 
                placeholder="e.g. Welcome to Yuyana!" 
                value={newRule.emailSubject}
                onChange={(e) => setNewRule({ ...newRule, emailSubject: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch 
                checked={newRule.active} 
                onCheckedChange={(val) => setNewRule({ ...newRule, active: val })} 
              />
              <Label>Activate Immediately</Label>
            </div>
            <Button onClick={handleSave} className="w-full mt-4 flex gap-2">
              <Save className="h-4 w-4" /> Save Rule
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm uppercase text-gray-500">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4 text-gray-600 dark:text-gray-400">
            <p>Automations are triggered by system events. When an event occurs (e.g., a visitor fills the lead form), the engine checks for active rules.</p>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border text-xs font-mono">
              Event: lead.created <br/>
              Data: customer_email, lead_id <br/>
              --- <br/>
              Action: Send "Welcome to Yuyana!"
            </div>
            <p>Coming Soon: Dynamic template selection and conditional logic (e.g., only send if country is "USA").</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Past Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Loader2 className="animate-spin mx-auto" /> : (
            <div className="divide-y">
              {rules.map(r => (
                <div key={r.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      {r.name} 
                      {!r.active && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded uppercase">Paused</span>}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Triggered by <span className="font-mono text-blue-600">{r.trigger}</span> • Subject: {r.emailSubject}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {rules.length === 0 && <p className="text-center py-4 text-gray-500">No automation rules defined yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
