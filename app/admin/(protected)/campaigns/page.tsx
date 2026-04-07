"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Mail, Send } from "lucide-react";
import Link from "next/link";

// export default function CampaignsPage() {
//   const [campaigns, setCampaigns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/campaigns")
//       .then((res) => res.json())
//       .then((data) => {
//         setCampaigns(data || []);
//         setLoading(false);
//       });
//   }, []);

//   const handleSend = async (id: string) => {
//     if (!confirm("Are you sure you want to send this campaign now?")) return;
    
//     try {
//       const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
//       const result = await res.json();
//       if (res.ok) {
//         alert(`Successfully sent to ${result.count} recipients!`);
//         // Refresh
//         window.location.reload();
//       } else {
//         alert(`Error: ${result.error}`);
//       }
//     } catch (err) {
//       alert("Failed to send campaign");
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Email Campaigns</h1>
//         <Link href="/admin/campaigns/new">
//           <Button className="flex items-center gap-2">
//             <Plus className="h-4 w-4" /> New Campaign
//           </Button>
//         </Link>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>History & Drafts</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex justify-center p-8">
//               <Loader2 className="h-8 w-8 animate-spin" />
//             </div>
//           ) : (
//             <div className="relative overflow-x-auto">
//               <table className="w-full text-sm text-left">
//                 <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
//                   <tr>
//                     <th className="px-6 py-3">Name</th>
//                     <th className="px-6 py-3">Subject</th>
//                     <th className="px-6 py-3">Segment</th>
//                     <th className="px-6 py-3">Status</th>
//                     <th className="px-6 py-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {campaigns.map((c) => (
//                     <tr key={c.id} className="border-b dark:border-gray-700">
//                       <td className="px-6 py-4 font-medium">{c.name}</td>
//                       <td className="px-6 py-4">{c.subject}</td>
//                       <td className="px-6 py-4">{c.segment?.name || "Inline Criteria"}</td>
//                       <td className="px-6 py-4">
//                         <span className={`px-2 py-1 rounded-full text-xs ${
//                           c.status === "COMPLETED" ? "bg-green-100 text-green-800" :
//                           c.status === "RUNNING" ? "bg-blue-100 text-blue-800" :
//                           "bg-gray-100 text-gray-800"
//                         }`}>
//                           {c.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         {c.status === "DRAFT" && (
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             className="flex items-center gap-1"
//                             onClick={() => handleSend(c.id)}
//                           >
//                             <Send className="h-3 w-3" /> Send
//                           </Button>
//                         )}
//                         {c.status === "COMPLETED" && (
//                            <span className="text-gray-500 text-xs">{c.recipientCount} sent</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                   {campaigns.length === 0 && (
//                     <tr>
//                       <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
//                         No campaigns found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
export default function CampaignsPage(){
  return (<div>Hello</div>);
}
