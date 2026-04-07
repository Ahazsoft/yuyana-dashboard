"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { TourPackage } from "@/app/data/mockTours";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const [title, setTitle] = useState(
    initialData?.tourTitle ?? initialData?.tourTitle ?? "",
  );
  const [slug, setSlug] = useState(
    initialData?.slugUrl ?? initialData?.id ?? "",
  );
  const [description, setDescription] = useState(
    initialData?.tourDescription ?? initialData?.tourDescription ?? "",
  );
  const [destination, setDestination] = useState(
    initialData?.tourDestination ?? initialData?.tourDestination ?? "",
  );
  const [duration, setDuration] = useState(
    initialData?.tourDuration?.toString() ??
      initialData?.tourDuration?.toString().replace(" days", "") ??
      "",
  );

  // File states
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Existing file URLs (for display)
  const [existingImageUrl, setExistingImageUrl] = useState(
    initialData?.imageUrl ?? initialData?.imageUrl ?? "",
  );
  const [existingDocumentUrl, setExistingDocumentUrl] = useState(
    initialData?.tourDocumentUrl ?? initialData?.tourDocumentUrl ?? "",
  );

  // Included / excluded
  const [included, setIncluded] = useState<string[]>(
    initialData?.included?.length ? initialData.included : [""],
  );
  const [excluded, setExcluded] = useState<string[]>(
    initialData?.excluded?.length ? initialData.excluded : [""],
  );

  // Pricing
  const initPrice = initialData?.tourPrice ?? initialData?.tourPrice ?? null;

  const [advancedPricing, setAdvancedPricing] = useState(() => {
    if (!initPrice) return false;
    const adult = Number((initPrice as any)?.adultprice ?? 0);
    const kid = Number((initPrice as any)?.kidprice ?? 0);
    const tag = Number((initPrice as any)?.pricetag ?? 0);

    return (
      !isNaN(adult) &&
      !isNaN(kid) &&
      !isNaN(tag) &&
      (adult > 0 || kid > 0 || tag > 0)
    );
  });

  const [simplePrice, setSimplePrice] = useState<number | null>(
    typeof initPrice === "number"
      ? initPrice
      : typeof initialData?.tourPrice === "number"
        ? initialData.tourPrice
        : (typeof initPrice === "object" && initPrice !== null
            ? Number((initPrice as any).pricetag)
            : 0) || 0,
  );

  const [pricing, setPricing] = useState({
    adult:
      typeof initPrice === "object" && initPrice !== null
        ? Number((initPrice as any).adultprice) || 0
        : 0,
    kid:
      typeof initPrice === "object" && initPrice !== null
        ? Number((initPrice as any).kidprice) || 0
        : 0,
    tag:
      typeof initPrice === "object" && initPrice !== null
        ? Number((initPrice as any).pricetag) || 0
        : 0,
  });

  // Published state
  //@ts-ignore
  const [published, setPublished] = useState(initialData?.isPublished ?? true);

  // Itinerary
  const [days, setDays] = useState<DayForm[]>(
    initialData?.tourPlanDays?.length
      ? initialData.tourPlanDays.map((d: any) => ({
          dayNumber: d.dayNumber,
          title: d.title || "",
          description: d.description || "",
          items: d.items || [],
          boldtext: d.boldtext || "",
        }))
      : [
          {
            dayNumber: 1,
            title: "",
            description: "",
            items: [""],
            boldtext: "",
          },
        ],
  );

  // Handle file inputs
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocumentFile(file);
    }
  };

  // Manage included/excluded items
  const addListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((prev) => [...prev, ""]);
  };

  const updateListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    value: string,
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const removeListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
  ) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  // Manage itinerary days
  const addDay = () => {
    const maxDayNum =
      days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) : 0;
    setDays((prev) => [
      ...prev,
      {
        dayNumber: maxDayNum + 1,
        title: "",
        description: "",
        items: [""],
        boldtext: "",
      },
    ]);
  };

  const updateDay = (idx: number, field: keyof DayForm, value: any) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeDay = (idx: number) => {
    setDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const addDayItem = (dayIdx: number) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIdx] = {
        ...updated[dayIdx],
        items: [...updated[dayIdx].items, ""],
      };
      return updated;
    });
  };

  const updateDayItem = (dayIdx: number, itemIdx: number, value: string) => {
    setDays((prev) => {
      const updated = [...prev];
      const newItems = [...updated[dayIdx].items];
      newItems[itemIdx] = value;
      updated[dayIdx] = { ...updated[dayIdx], items: newItems };
      return updated;
    });
  };

  const removeDayItem = (dayIdx: number, itemIdx: number) => {
    setDays((prev) => {
      const updated = [...prev];
      const newItems = updated[dayIdx].items.filter((_, i) => i !== itemIdx);
      updated[dayIdx] = { ...updated[dayIdx], items: newItems };
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare form data
    const formData = new FormData();

    // Basic info
    formData.append("slugUrl", slug);
    formData.append("tourTitle", title);
    formData.append("tourDestination", destination);
    formData.append("tourDescription", description);
    formData.append("tourDuration", duration);

    // Pricing
    if (advancedPricing) {
      formData.append(
        "tourPrice",
        JSON.stringify({
          adultprice: pricing.adult,
          kidprice: pricing.kid,
          pricetag: pricing.tag,
        }),
      );
    } else {
      formData.append("tourPrice", JSON.stringify(simplePrice));
    }

    // Included/excluded
    formData.append("included", JSON.stringify(included.filter(Boolean)));
    formData.append("excluded", JSON.stringify(excluded.filter(Boolean)));

    // Itinerary
    formData.append("tourPlanDays", JSON.stringify(days));

    // Status
    formData.append("isPublished", published.toString());

    // Files
    if (newImageFile) {
      formData.append("image", newImageFile);
    }
    if (newDocumentFile) {
      formData.append("document", newDocumentFile);
    }

    try {
      // Call the API to update the tour
      const response = await fetch(`/api/tours/edit/${slug}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to update tour");
        return;
      }

      alert(result.message || "Tour updated successfully!");
      console.log("Updated tour data:", result.tour);

      // Redirect to tours list
      router.push("/admin/tours");
    } catch (error) {
      console.error("Error updating tour:", error);
      alert("Something went wrong while updating the tour.");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Back + Title */}
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
          {/* General Info */}
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
                placeholder="e.g. Historical Tour of Ethiopia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug URL *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="e.g. historical-tour-ethiopia"
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
                  placeholder="e.g. Addis Ababa, Ethiopia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  min="1"
                  placeholder="e.g. 7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the tour..."
              />
            </div>
          </section>

          {/* Media */}
          <section className="space-y-4 rounded-lg border border-black bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Media</h2>
            <Separator />

            <div className="space-y-4">
              <div>
                <Label>Current Image</Label>
                {existingImageUrl ? (
                  <div className="mt-2">
                    <Image
                      src={existingImageUrl}
                      alt="Current tour image"
                      width={300}
                      height={200}
                      className="rounded object-cover"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No image uploaded
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload New Image (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {newImagePreview && (
                  <div className="mt-2">
                    <Image
                      src={newImagePreview}
                      alt="Preview"
                      width={300}
                      height={200}
                      className="rounded object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">
                  Upload Tour Document (PDF, DOCX, etc.)
                </Label>
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleDocumentChange}
                />
                {existingDocumentUrl && !newDocumentFile && (
                  <p className="text-sm text-muted-foreground">
                    Current document:{" "}
                    <a
                      href={existingDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View current document
                    </a>
                  </p>
                )}
                {newDocumentFile && (
                  <p className="text-sm text-muted-foreground">
                    New file selected: {newDocumentFile.name}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4 rounded-lg border border-black bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
            <Separator />

            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-pricing"
                checked={advancedPricing}
                onCheckedChange={setAdvancedPricing}
              />
              <Label htmlFor="advanced-pricing">Use Advanced Pricing</Label>
            </div>

            {advancedPricing ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="adult-price">Adult Price ($)</Label>
                  <Input
                    id="adult-price"
                    type="number"
                    value={pricing.adult}
                    onChange={(e) =>
                      setPricing({ ...pricing, adult: Number(e.target.value) })
                    }
                    min="0"
                    step="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kid-price">Kid Price ($)</Label>
                  <Input
                    id="kid-price"
                    type="number"
                    value={pricing.kid}
                    onChange={(e) =>
                      setPricing({ ...pricing, kid: Number(e.target.value) })
                    }
                    min="0"
                    step="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-price">Price Tag ($)</Label>
                  <Input
                    id="tag-price"
                    type="number"
                    value={pricing.tag}
                    onChange={(e) =>
                      setPricing({ ...pricing, tag: Number(e.target.value) })
                    }
                    min="0"
                    step="10"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="simple-price">Price ($)</Label>
                <Input
                  id="simple-price"
                  type="number"
                  value={simplePrice ?? 0}
                  onChange={(e) => setSimplePrice(Number(e.target.value))}
                  min="0"
                  step="10"
                />
              </div>
            )}
          </section>

          {/* Inclusions */}
          <section className="space-y-4 rounded-lg border border-black bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Inclusions
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
                      placeholder="e.g. Hotel"
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
                      placeholder="e.g. Flights"
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
                <div key={idx} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">Day {day.dayNumber}</h3>
                    {days.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDay(idx)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input
                        value={day.title}
                        onChange={(e) =>
                          updateDay(idx, "title", e.target.value)
                        }
                        placeholder="e.g. Arrival in Addis Ababa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bold Text (optional)</Label>
                      <Input
                        value={day.boldtext}
                        onChange={(e) =>
                          updateDay(idx, "boldtext", e.target.value)
                        }
                        placeholder="e.g. Free time"
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={day.description}
                      onChange={(e) =>
                        updateDay(idx, "description", e.target.value)
                      }
                      rows={2}
                      placeholder="What will happen during this day?"
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label>Itinerary Items (optional)</Label>
                    {day.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) =>
                            updateDayItem(idx, iIdx, e.target.value)
                          }
                        />
                        {day.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDayItem(idx, iIdx)}
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
                      onClick={() => addDayItem(idx)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Publish Settings */}
          <section className="space-y-4 rounded-lg border border-black bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Publish Settings
            </h2>
            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published" className="text-base font-semibold">
                  Publish Tour
                </Label>
                <p className="text-sm text-muted-foreground">
                  Controls whether this tour is visible to customers
                </p>
              </div>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
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
