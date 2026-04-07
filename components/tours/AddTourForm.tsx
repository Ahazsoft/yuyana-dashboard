"use client";

import React, { useState } from "react";
import { Trash2, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface DayForm {
  dayNumber: number;
  title: string;
  description: string;
  items: string[];
  boldtext: string;
}

const AddTourForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");

  // File states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentPreviewName, setDocumentPreviewName] = useState<string | null>(null);

  // Included / excluded
  const [included, setIncluded] = useState<string[]>([""]);
  const [excluded, setExcluded] = useState<string[]>([""]);

  // Pricing
  const [advancedPricing, setAdvancedPricing] = useState(false);
  const [simplePrice, setSimplePrice] = useState<number | null>(null);
  const [pricing, setPricing] = useState({
    adult: 0,
    kid: 0,
    tag: 0,
  });

  // Itinerary
  const [days, setDays] = useState<DayForm[]>([
    { dayNumber: 1, title: "", description: "", items: [""], boldtext: "" },
  ]);

  // File handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentPreviewName(file.name);
    }
  };

  // List helpers
  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const updateListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    value: string
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const removeListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  // Itinerary helpers
  const addDay = () => {
    const maxDayNum = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) : 0;
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

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();

    // Basic info
    formData.append("slugUrl", slug);
    formData.append("tourTitle", title);
    formData.append("tourDestination", destination);
    if (description) formData.append("tourDescription", description);
    if (duration) formData.append("tourDuration", duration);

    // Pricing
    if (advancedPricing) {
      formData.append(
        "tourPrice",
        JSON.stringify({
          adultprice: pricing.adult,
          kidprice: pricing.kid,
          pricetag: pricing.tag,
        })
      );
    } else {
      formData.append("tourPrice", JSON.stringify(simplePrice ?? 0));
    }

    // Included/Excluded
    formData.append("included", JSON.stringify(included.filter(Boolean)));
    formData.append("excluded", JSON.stringify(excluded.filter(Boolean)));

    // Itinerary
    formData.append("tourPlanDays", JSON.stringify(days));

    // Files
    if (imageFile) formData.append("image", imageFile);
    if (documentFile) formData.append("document", documentFile);

    try {
      const response = await fetch("/api/tours/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to create tour");
        return;
      }

      alert("Tour created successfully!");
      router.push("/admin/tours");
    } catch (error) {
      console.error("Error creating tour:", error);
      alert("Something went wrong while creating the tour.");
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-2xl font-bold text-foreground">Add New Tour</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <section className="space-y-4 rounded-lg border border-black bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">General Information</h2>
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
              <div className="space-y-2">
                <Label htmlFor="image">Tour Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={300}
                      height={200}
                      className="rounded object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Tour Document (PDF, DOCX, etc.)</Label>
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleDocumentChange}
                />
                {documentPreviewName && (
                  <p className="text-sm text-muted-foreground">Selected: {documentPreviewName}</p>
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
                    onChange={(e) => setPricing({ ...pricing, adult: Number(e.target.value) })}
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
                    onChange={(e) => setPricing({ ...pricing, kid: Number(e.target.value) })}
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
                    onChange={(e) => setPricing({ ...pricing, tag: Number(e.target.value) })}
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
                  value={simplePrice ?? ""}
                  onChange={(e) => setSimplePrice(Number(e.target.value))}
                  min="0"
                  step="10"
                  placeholder="0"
                />
              </div>
            )}
          </section>

          {/* Inclusions */}
          <section className="space-y-4 rounded-lg border border-black bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Inclusions</h2>
            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>Included</Label>
                {included.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateListItem(setIncluded, idx, e.target.value)}
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
                      onChange={(e) => updateListItem(setExcluded, idx, e.target.value)}
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
              <h2 className="text-lg font-semibold text-foreground">Itinerary</h2>
              <Button type="button" variant="outline" size="sm" onClick={addDay}>
                <Plus className="mr-1 h-3 w-3" /> Add Day
              </Button>
            </div>
            <Separator />

            {days.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No days added yet. Click "Add Day" to start building the itinerary.
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
                        onChange={(e) => updateDay(idx, "title", e.target.value)}
                        placeholder="e.g. Arrival in Addis Ababa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bold Text (optional)</Label>
                      <Input
                        value={day.boldtext}
                        onChange={(e) => updateDay(idx, "boldtext", e.target.value)}
                        placeholder="e.g. Free time"
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={day.description}
                      onChange={(e) => updateDay(idx, "description", e.target.value)}
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
                          onChange={(e) => updateDayItem(idx, iIdx, e.target.value)}
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/tours")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Tour"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTourForm;