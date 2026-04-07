"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, 
  FileText, CheckCircle2, MessageSquare, Download, 
  Upload, TrendingUp, AlertCircle, Zap, DollarSign,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedValue: number;
  description: string;
  createdAt: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  icon?: React.ReactNode;
}

// export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
//   const router = useRouter();
//   const [lead, setLead] = useState<Lead | null>(null);
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [converting, setConverting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const id = (await params).id;
        
//         // Try fetching real data (falling back to mock if needed during testing)
//         try {
//           const res = await fetch(`/api/leads/${id}`);
//           if (res.ok) {
//             const data = await res.json();
//             // Map real data to UI interface
//             setLead({
//               id: data.id,
//               firstName: data.customer?.firstName || "Unknown",
//               lastName: data.customer?.lastName || "Lead",
//               email: data.customer?.email || "",
//               phone: data.customer?.phone || "",
//               status: data.status,
//               source: data.source || "Direct",
//               priority: (data.priority as any) || "MEDIUM",
//               estimatedValue: data.estimatedValue || 0,
//               description: data.description || "",
//               createdAt: data.createdAt,
//             });
//             setActivities(data.leadActivity || []);
//             setLoading(false);
//             return;
//           }
//         } catch (e) {}

//         // Mock Lead Data fallback
//         const mockLead: Lead = {
//           id: id,
//           firstName: "Alice",
//           lastName: "Johnson",
//           email: "alice@example.com",
//           phone: "+1234567890",
//           status: "QUALIFIED",
//           source: "Website Form",
//           priority: "HIGH",
//           estimatedValue: 2500,
//           description: "Interested in a 10-day historical tour for a family of 4. Prefers luxury accommodation and private guide.",
//           createdAt: "2024-03-15T10:00:00Z",
//         };

//         const mockActivities: Activity[] = [
//           {
//             id: "l1",
//             type: "Lead Created",
//             description: "Inquiry received via Website Contact Form.",
//             createdAt: "2024-03-15T10:00:00Z",
//             icon: <Zap className="h-4 w-4 text-yellow-500" />
//           },
//           {
//             id: "l4",
//             type: "Status Changed",
//             description: "Lead qualified after interest confirmation and budget alignment.",
//             createdAt: "2024-03-18T15:45:00Z",
//             icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
//           }
//         ];

//         setLead(mockLead);
//         setActivities(mockActivities);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params]);

//   const handleConvert = async () => {
//     if (!lead || converting) return;
    
//     setConverting(true);
//     const id = lead.id;

//     try {
//       const res = await fetch(`/api/leads/${id}/convert`, {
//         method: "POST",
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Conversion failed");
//       }

//       const result = await res.json();
      
//       toast.success("Lead Converted Successfully", {
//         description: "The lead has been turned into a booking and moved to Customers list."
//       });

//       // Redirect to the newly created booking
//       router.push(`/admin/bookings/${result.bookingId}`);
//     } catch (err) {
//       toast.error("Conversion Failed", {
//         description: err instanceof Error ? err.message : "Please try again later."
//       });
//     } finally {
//       setConverting(false);
//     }
//   };

//   if (loading) return (
//     <div className="flex items-center justify-center p-20">
//       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//     </div>
//   );
  
//   if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;
//   if (!lead) return <div className="p-8 text-center text-muted-foreground">Lead not found</div>;

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="sm" asChild>
//             <Link href="/admin/leads">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Leads
//             </Link>
//           </Button>
//           <h1 className="text-3xl font-bold">Lead: {lead.firstName} {lead.lastName}</h1>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" size="sm">Edit Lead</Button>
//           <Button 
//             size="sm" 
//             className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
//             onClick={handleConvert}
//             disabled={converting || lead.status === "WON"}
//           >
//             {converting ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <TrendingUp className="h-4 w-4" />
//             )}
//             {lead.status === "WON" ? "Converted" : "Convert to Booking"}
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
//         {/* Left Sidebar: Contact Info & Status */}
//         <div className="lg:col-span-1 space-y-6">
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status & Priority</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex flex-col gap-1">
//                 <span className="text-xs text-muted-foreground">Current Status</span>
//                 <Badge className="w-fit">{lead.status}</Badge>
//               </div>
//               <div className="flex flex-col gap-1">
//                 <span className="text-xs text-muted-foreground">Priority</span>
//                 <Badge 
//                   variant={lead.priority === "HIGH" ? "destructive" : lead.priority === "MEDIUM" ? "default" : "outline"} 
//                   className="w-fit"
//                 >
//                   {lead.priority}
//                 </Badge>
//               </div>
//               <Separator />
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2 text-sm">
//                   <Mail className="h-4 w-4 text-muted-foreground" />
//                   <span className="truncate">{lead.email}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <Phone className="h-4 w-4 text-muted-foreground" />
//                   <span>{lead.phone}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <Zap className="h-4 w-4 text-muted-foreground" />
//                   <span>Source: {lead.source}</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-primary/5 border-primary/20">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider flex items-center gap-2">
//                 <DollarSign className="h-4 w-4" /> Estimated Value
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-2xl font-bold text-primary">${(lead.estimatedValue || 0).toLocaleString()}</p>
//               <p className="text-xs text-muted-foreground mt-1">Based on initial inquiry</p>
//             </CardContent>
//           </Card>
//         </div>
        
//         {/* Main Content Area: Tabs */}
//         <div className="lg:col-span-3 space-y-6">
//           <Tabs defaultValue="overview" className="w-full">
//             <TabsList className="mb-4">
//               <TabsTrigger value="overview">Overview & Notes</TabsTrigger>
//               <TabsTrigger value="activity">Timeline</TabsTrigger>
//               <TabsTrigger value="docs">Related Documents</TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview" className="space-y-4">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Inquiry Description</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="bg-muted/30 p-4 rounded-lg border italic text-sm leading-relaxed">
//                     "{lead.description || "No description provided."}"
//                   </div>
//                   <div className="mt-6 flex flex-col gap-4">
//                     <h4 className="font-semibold text-sm">Quick Notes</h4>
//                     <textarea 
//                       className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
//                       placeholder="Add a internal note about this lead..."
//                     />
//                     <Button size="sm" className="w-fit">Save Note</Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="activity" className="space-y-4">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Interaction History</CardTitle>
//                   <CardDescription>Visual trail of all changes and outreach</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="relative border-l pl-6 space-y-8 ml-3 py-2">
//                     {activities.length > 0 ? activities.map((activity) => (
//                       <div key={activity.id} className="relative">
//                         <span className="absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full bg-background border ring-4 ring-background shadow-sm">
//                           {activity.icon || <div className="h-2 w-2 rounded-full bg-primary" />}
//                         </span>
//                         <div className="flex flex-col gap-1">
//                           <h4 className="font-semibold text-sm">{activity.type}</h4>
//                           <p className="text-sm text-muted-foreground">{activity.description}</p>
//                           <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
//                             <Calendar className="h-3 w-3" />
//                             {new Date(activity.createdAt).toLocaleString()}
//                           </span>
//                         </div>
//                       </div>
//                     )) : (
//                       <p className="text-muted-foreground text-sm italic">No activities logged yet.</p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="docs" className="space-y-4">
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between">
//                   <div>
//                     <CardTitle>Lead Documents</CardTitle>
//                     <CardDescription>Itineraries, proposals, and identification</CardDescription>
//                   </div>
//                   <Button size="sm" variant="outline" className="gap-2">
//                     <Upload className="h-4 w-4" /> Upload
//                   </Button>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="border border-dashed rounded-lg py-12 text-center text-muted-foreground col-span-full">
//                       <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                       <p>No documents uploaded for this lead</p>
//                       <Button variant="link" size="sm" className="mt-2">Upload initial quote</Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// }
export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {

  return (<div>Hello</div>);
}

