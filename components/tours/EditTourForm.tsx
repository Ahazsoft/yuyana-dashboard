  "use client";

  import React, { useState } from "react";
  import { Trash2, Plus, ArrowLeft } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import { Separator } from "@/components/ui/separator";
  import type { TourPackage } from "@/app/data/mockTours";
  import { useRouter } from "next/navigation";

  interface EditTourFormProps {
    initialData: TourPackage;
  }

  interface DayForm {
    dayNumber: number;
    title: string;
    description: string;
    items: string[];
    boldtext: string;
  }

  const EditTourForm = ({ initialData }: EditTourFormProps) => {
    const router = useRouter();

    if (!initialData) {
      return (
        <div className="p-12">
          <img
            src="https://i.imgur.com/6KAfjPq_d.jpeg?maxwidth=520&shape=thumb&fidelity=high"
            alt=""
            style={{
              width: "10vw",
              height: "10vw",
              border: "1px solid red",
            }}
          />
          <h1>404 Not found</h1>
        </div>
      );
    }

    // Basic fields
    const [title, setTitle] = useState(initialData?.tourTitle ?? "");
    const [slug, setSlug] = useState(initialData?.slugUrl ?? "");
    const [description, setDescription] = useState(
      initialData?.tourDescription ?? "",
    );
    const [destination, setDestination] = useState(
      initialData?.tourDestination ?? "",
    );
    const [duration, setDuration] = useState(
      initialData?.tourDuration?.toString() ?? "",
    );

    // File states
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

    // Existing file URLs (for display)
    const [existingImageUrl, setExistingImageUrl] = useState(
      initialData?.imageUrl ?? "",
    );
    const [existingDocumentUrl, setExistingDocumentUrl] = useState(
      initialData?.tourDocumentUrl ?? "",
    );

    // Included / excluded
    const [included, setIncluded] = useState<string[]>(
      initialData?.included?.length ? initialData.included : [""],
    );
    const [excluded, setExcluded] = useState<string[]>(
      initialData?.excluded?.length ? initialData.excluded : [""],
    );

    // Pricing
    const initPrice = initialData?.tourPrice as Record<string, unknown> | null;

    const [advancedPricing, setAdvancedPricing] = useState(() => {
      if (!initPrice) return false;
      const adult = Number(initPrice.adultprice ?? 0);
      const kid = Number(initPrice.kidprice ?? 0);
      const tag = Number(initPrice.pricetag ?? 0);
      return adult > 0 || kid > 0 || tag > 0;
    });

    const [standardPrice, setStandardPrice] = useState(
      initPrice?.price?.toString() ?? "",
    );
    const [adultPrice, setAdultPrice] = useState(
      initPrice?.adultprice?.toString() ?? "",
    );
    const [kidsPrice, setKidsPrice] = useState(
      initPrice?.kidprice?.toString() ?? "",
    );
    const [priceTag, setPriceTag] = useState(
      initPrice?.pricetag?.toString() ?? "",
    );

    // Itinerary days
    const [days, setDays] = useState<DayForm[]>(() => {
      if (initialData?.tourPlanDays?.length) {
        return initialData.tourPlanDays.map((d) => ({
          dayNumber: d.dayNumber,
          title: d.title ?? "",
          description: d.description ?? "",
          items: d.items.length ? d.items : [""],
          boldtext: d.boldtext ?? "",
        }));
      }
      return [];
    });

    // Handlers for days
    const addDay = () => {
      setDays((prev) => [
        ...prev,
        {
          dayNumber: prev.length + 1,
          title: "",
          description: "",
          items: [""],
          boldtext: "",
        },
      ]);
    };

    const removeDay = (idx: number) => {
      setDays((prev) =>
        prev
          .filter((_, i) => i !== idx)
          .map((d, i) => ({ ...d, dayNumber: i + 1 })),
      );
    };

    const updateDay = (
      idx: number,
      field: keyof DayForm,
      value: string | string[],
    ) => {
      setDays((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
      );
    };

    // Handlers for list items (included/excluded)
    const addListItem = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
    ) => {
      setter((prev) => [...prev, ""]);
    };

    const removeListItem = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      idx: number,
    ) => {
      setter((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateListItem = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      idx: number,
      val: string,
    ) => {
      setter((prev) => prev.map((v, i) => (i === idx ? val : v)));
    };

    // File change handler
    const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "image" | "document",
    ) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];

      if (type === "image") {
        setNewImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setNewImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setNewDocumentFile(file);
      }
    };

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Build tourPrice object
      let tourPrice: Record<string, unknown> = {};

      if (!advancedPricing) {
        tourPrice = {
          price: parseFloat(standardPrice) || 0,
          adultprice: 0,
          kidprice: 0,
          pricetag: 0,
        };
      } else {
        tourPrice = {
          price: 0,
          adultprice: adultPrice ? parseFloat(adultPrice) : 0,
          kidprice: kidsPrice ? parseFloat(kidsPrice) : 0,
          pricetag: priceTag ? parseFloat(priceTag) : 0,
        };

        const hasAdultKids =
          (tourPrice.adultprice as number) > 0 ||
          (tourPrice.kidprice as number) > 0;
        const hasPriceTag = (tourPrice.pricetag as number) > 0;

        if (!hasAdultKids && !hasPriceTag) {
          alert("Please fill either Adult/Kids prices or the Price Tag.");
          return;
        }
      }

      // Build FormData
      const formData = new FormData();

      formData.append("slugUrl", slug);
      formData.append("tourTitle", title);
      formData.append("tourDestination", destination);
      if (description) formData.append("tourDescription", description);
      if (duration) formData.append("tourDuration", duration);
      formData.append(
        "included",
        JSON.stringify(included.filter(Boolean)),
      );
      formData.append(
        "excluded",
        JSON.stringify(excluded.filter(Boolean)),
      );
      formData.append("tourPrice", JSON.stringify(tourPrice));
      formData.append(
        "tourPlanDays",
        JSON.stringify(
          days.map((d) => ({
            dayNumber: d.dayNumber,
            title: d.title || null,
            description: d.description || null,
            items: d.items.filter(Boolean),
            boldtext: d.boldtext || null,
          })),
        ),
      );

      // Files – send new files if selected, otherwise send existing URLs
      if (newImageFile) {
        formData.append("image", newImageFile);
      } else {
        formData.append("imageUrl", existingImageUrl || "");
      }

      if (newDocumentFile) {
        formData.append("document", newDocumentFile);
      } else {
        formData.append("documentUrl", existingDocumentUrl || "");
      }

      try {
        const response = await fetch(`/api/tours/${initialData.id}`, {
          method: "PUT",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          console.log(result.error);

          alert(result.error || "Failed to update tour");
          return;
        }

        alert("Tour updated successfully!");
        router.push("/admin/tours");
      } catch (error) {
        console.error("Error updating tour:", error);
        alert("Something went wrong while updating the tour.");
      }
    };

    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/tours")}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Tours
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Edit Tour</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Information */}
            <section className="space-y-4 rounded-lg border border-black bg-card p-5">
              <h2 className="text-lg font-semibold text-foreground">
                General Information
              </h2>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="title">Tour Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug URL *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration in days</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              {/* File uploads */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Image */}
                <div className="space-y-2">
                  <Label>Tour Image</Label>
                  {existingImageUrl && !newImageFile && (
                    <div className="mb-2">
                      <img
                        src={existingImageUrl}
                        alt="Current"
                        className="max-h-40 rounded-md"
                      />
                      <p className="text-xs text-muted-foreground">
                        Current image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                  />
                  {newImagePreview && (
                    <div className="mt-2">
                      <img
                        src={newImagePreview}
                        alt="Preview"
                        className="max-h-40 rounded-md"
                      />
                      <p className="text-xs text-muted-foreground">
                        New image preview
                      </p>
                    </div>
                  )}
                </div>

                {/* Document */}
                <div className="space-y-2">
                  <Label>Tour Document</Label>
                  {existingDocumentUrl && !newDocumentFile && (
                    <div className="mb-2">
                      <a
                        href={existingDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        Current document
                      </a>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "document")}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                  />
                  {newDocumentFile && (
                    <p className="mt-1 text-sm">{newDocumentFile.name}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="space-y-4 rounded-lg border border-black bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="advancedPricing"
                    className="text-sm text-muted-foreground"
                  >
                    Advanced
                  </Label>
                  <Switch
                    id="advancedPricing"
                    checked={advancedPricing}
                    onCheckedChange={setAdvancedPricing}
                  />
                </div>
              </div>
              <Separator />

              {!advancedPricing ? (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="adultPrice">Adult Price ($)</Label>
                      <Input
                        id="adultPrice"
                        type="number"
                        min={0}
                        step={0.01}
                        value={adultPrice}
                        onChange={(e) => setAdultPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kidsPrice">Kids Price ($)</Label>
                      <Input
                        id="kidsPrice"
                        type="number"
                        min={0}
                        step={0.01}
                        value={kidsPrice}
                        onChange={(e) => setKidsPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceTag">Price Tag ($)</Label>
                      <Input
                        id="priceTag"
                        type="number"
                        min={0}
                        step={0.01}
                        value={priceTag}
                        onChange={(e) => setPriceTag(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Included & Excluded */}
            <section className="space-y-4 rounded-lg border border-black bg-card p-5">
              <h2 className="text-lg font-semibold text-foreground">
                Included & Excluded
              </h2>
              <Separator />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label>Included</Label>
                  {included.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) =>
                          updateListItem(setIncluded, idx, e.target.value)
                        }
                      />
                      {included.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeListItem(setIncluded, idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(setIncluded)}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label>Excluded</Label>
                  {excluded.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) =>
                          updateListItem(setExcluded, idx, e.target.value)
                        }
                      />
                      {excluded.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeListItem(setExcluded, idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(setExcluded)}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
              </div>
            </section>

            {/* Itinerary */}
            <section className="space-y-4 rounded-lg border border-black bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Itinerary
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDay}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Day
                </Button>
              </div>
              <Separator />

              {days.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No days added yet. Click "Add Day" to start building the
                  itinerary.
                </p>
              )}

              <div className="space-y-4">
                {days.map((day, idx) => (
                  <div
                    key={idx}
                    className="space-y-3 rounded-md border border-black bg-background p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-primary">
                        Day {day.dayNumber}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDay(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={day.title}
                          onChange={(e) =>
                            updateDay(idx, "title", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Important Note</Label>
                        <Input
                          value={day.boldtext}
                          onChange={(e) =>
                            updateDay(idx, "boldtext", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={day.description}
                        onChange={(e) =>
                          updateDay(idx, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Items</Label>
                      {day.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [...day.items];
                              newItems[iIdx] = e.target.value;
                              updateDay(idx, "items", newItems);
                            }}
                          />
                          {day.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newItems = day.items.filter(
                                  (_, i) => i !== iIdx,
                                );
                                updateDay(idx, "items", newItems);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateDay(idx, "items", [...day.items, ""])
                        }
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Item
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/tours")}
              >
                Cancel
              </Button>
              <Button type="submit">Update Tour</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default EditTourForm;