
"use client";

import { useState, useMemo, useRef } from "react";
import { TourCard } from "@/components/tour-card";
import { tours } from "@/lib/data";
import { Tour } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Globe, 
  X,
  LayoutGrid,
  List,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Image from "next/image";

const REGIONS = ["Ethiopia", "Africa", "Europe", "Asia", "Middle East", "America"];
const CATEGORIES = ["Adventure", "Culture", "History", "Nature", "Wildlife", "Beach", "City Tour", "Short Tour"];

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [allTours, setAllTours] = useState<Tour[]>(tours);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    region: "",
    price: "",
    duration: "",
    description: "",
    image: "",
    category: ""
  });

  const getRegionFromLocation = (location: string) => {
    const loc = location.toLowerCase();
    if (loc.includes("ethiopia")) return "Ethiopia";
    if (loc.includes("africa")) return "Africa";
    if (loc.includes("europe")) return "Europe";
    if (loc.includes("asia")) return "Asia";
    if (loc.includes("middle east")) return "Middle East";
    if (loc.includes("america") || loc.includes("usa")) return "America";
    return "";
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      location: tour.location,
      region: getRegionFromLocation(tour.location),
      price: tour.price.toString(),
      duration: tour.duration,
      description: tour.description,
      image: tour.image,
      category: tour.tags?.[0] || ""
    });
    setImagePreview(tour.image);
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingTour(null);
    setFormData({ title: "", location: "", region: "", price: "", duration: "", description: "", image: "", category: "" });
    setImagePreview(null);
    setIsSheetOpen(true);
  };

  const filteredTours = useMemo(() => {
    return allTours.filter(tour => {
      const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tour.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tour.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || tour.tags?.includes(selectedCategory);
      
      const locationMatch = tour.location.toLowerCase();
      const matchesRegion = selectedRegion === "All" || 
                           (selectedRegion === "Ethiopia" && locationMatch.includes("ethiopia")) ||
                           (selectedRegion === "Africa" && (locationMatch.includes("africa") || locationMatch.includes("tanzania") || locationMatch.includes("kenya") || locationMatch.includes("seychelles") || locationMatch.includes("mombasa") || locationMatch.includes("zanzibar"))) ||
                           (selectedRegion === "Europe" && (locationMatch.includes("europe") || locationMatch.includes("greece") || locationMatch.includes("italy") || locationMatch.includes("france") || locationMatch.includes("germany") || locationMatch.includes("istanbul") || locationMatch.includes("swiss"))) ||
                           (selectedRegion === "Asia" && (locationMatch.includes("asia") || locationMatch.includes("indonesia") || locationMatch.includes("thailand") || locationMatch.includes("japan"))) ||
                           (selectedRegion === "Middle East" && (locationMatch.includes("middle east") || locationMatch.includes("dubai") || locationMatch.includes("istanbul"))) ||
                           (selectedRegion === "America" && (locationMatch.includes("america") || locationMatch.includes("usa")));

      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [searchQuery, selectedCategory, selectedRegion, allTours]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTour = () => {
    const tourData: Tour = {
      id: editingTour ? editingTour.id : `tour-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      price: parseInt(formData.price) || 0,
      duration: formData.duration,
      location: formData.location || `${formData.region}`,
      image: formData.image || "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2000&auto=format&fit=crop",
      rating: editingTour ? editingTour.rating : 5.0,
      reviewsCount: editingTour ? editingTour.reviewsCount : 0,
      tags: formData.category ? [formData.category] : []
    };

    if (editingTour) {
      setAllTours(prev => prev.map(t => t.id === editingTour.id ? tourData : t));
      toast.success("Tour updated successfully!", {
        description: `${formData.title} has been updated.`,
      });
    } else {
      setAllTours(prev => [tourData, ...prev]);
      toast.success("Tour published successfully!", {
        description: `${formData.title} is now live on the website.`,
      });
    }
    setFormData({ title: "", location: "", region: "", price: "", duration: "", description: "", image: "", category: "" });
    setImagePreview(null);
    setEditingTour(null);
    setIsSheetOpen(false);
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}>
      <AppSidebar variant='inset' />
      <SidebarInset>
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 pt-6">
          <div className="px-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
                <p className="text-muted-foreground mt-1">Add and organize your travel packages by region and type.</p>
              </div>
              
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <Button onClick={handleAddNew} className="rounded-xl px-6 h-12 font-semibold shadow-lg shadow-primary/20 gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Tour
                </Button>
                <SheetContent className="sm:max-w-xl overflow-y-auto px-8 py-10">
                  <SheetHeader>
                    <SheetTitle className="text-3xl font-bold">{editingTour ? "Edit Travel Package" : "New Travel Package"}</SheetTitle>
                    <SheetDescription className="text-lg">{editingTour ? "Update your tour itinerary details below." : "Configure your new tour itinerary below."}</SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-8 py-10">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold">Tour Title</Label>
                        <Input placeholder="e.g. Zanzibar Paradise" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold">Region</Label>
                          <Select value={formData.region} onValueChange={v => setFormData({...formData, region: v})}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select Destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold">Specific Location</Label>
                        <Input placeholder="e.g. Stone Town, Zanzibar" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold">Type / Category</Label>
                          <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold">Price (ETB)</Label>
                        <Input type="number" placeholder="750" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold">Duration</Label>
                        <Input placeholder="5 Days" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Description</Label>
                      <textarea 
                        className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                        placeholder="Detailed itinerary and highlights..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label className="text-sm font-semibold">Tour Cover Image</Label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden relative"
                      >
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={fileInputRef} 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview ? (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-medium flex items-center gap-2">
                                <Upload className="w-5 h-5" /> Change Image
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4">
                            <div className="bg-slate-50 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="font-semibold text-slate-700 dark:text-zinc-300">Click to upload image</p>
                            <p className="text-sm text-muted-foreground mt-1">PNG, JPG or WebP (Max 2MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <SheetFooter className="mt-6">
                      <Button onClick={handleAddTour} className="w-full h-14 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20">
                        {editingTour ? "Update Tour" : "Publish to Website"}
                      </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[1.5rem] p-3 shadow-sm flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search tours..."
                  className="pl-12 h-12 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-0 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px] h-12 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-none">
                    <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="All">All Regions</SelectItem>
                    {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1 hidden lg:block" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12 rounded-xl gap-2 px-4 hover:bg-slate-50">
                      <Filter className="w-5 h-5 text-muted-foreground" />
                      <span>{selectedCategory === "All" ? "All Types" : selectedCategory}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 drop-shadow-2xl">
                    <DropdownMenuLabel className="font-bold">Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={selectedCategory === "All"} onCheckedChange={() => setSelectedCategory("All")}>All Types</DropdownMenuCheckboxItem>
                    {CATEGORIES.map(cat => (
                      <DropdownMenuCheckboxItem 
                        key={cat}
                        checked={selectedCategory === cat}
                        onCheckedChange={() => setSelectedCategory(cat)}
                        className="rounded-lg"
                      >
                        {cat}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {(searchQuery || selectedCategory !== "All" || selectedRegion !== "All") && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedRegion("All");
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Available Tours <span className="text-muted-foreground text-base ml-2">({filteredTours.length})</span>
              </h2>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm rounded-md"><LayoutGrid className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><List className="w-4 h-4" /></Button>
              </div>
            </div>

            {filteredTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredTours.map((tour, index) => (
                  <div 
                    key={tour.id} 
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" 
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TourCard tour={tour} onEdit={handleEdit} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-dashed border-slate-300 dark:border-zinc-800 py-32 text-center">
                <div className="bg-slate-50 dark:bg-zinc-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Search className="w-10 h-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">No results for this selection</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                  Try changing the region or type to see more tours.
                </p>
                <Button variant="outline" className="mt-8 rounded-xl" onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedRegion("All");
                }}>
                  Reset all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
