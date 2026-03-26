"use client";

import React, { useState } from "react";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface DayForm {
  dayNumber: number;
  title: string;
  description: string;
  items: string[];
  boldtext: string;
}

const AddTourForm = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const [included, setIncluded] = useState<string[]>([""]);
  const [excluded, setExcluded] = useState<string[]>([""]);

  const [advancedPricing, setAdvancedPricing] = useState(false);
  const [standardPrice, setStandardPrice] = useState("");
  const [adultPrice, setAdultPrice] = useState("");
  const [kidsPrice, setKidsPrice] = useState("");
  const [priceTag, setPriceTag] = useState("");

  const [days, setDays] = useState<DayForm[]>([]);

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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "document",
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (type === "image") {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result as string); // required preview
      reader.readAsDataURL(file);
    } else if (type === "document") {
      setDocumentFile(file);

      // Just display the filename as a placeholder
      setDocumentUrl(file.name);
    }
    // For document, you can allow null
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   let tourPrice: Record<string, unknown> = {};

  //   if (!advancedPricing) {
  //     tourPrice = {
  //       price: parseFloat(standardPrice) || 0,
  //       adultprice: 0,
  //       kidprice: 0,
  //       pricetag: 0,
  //     };
  //   } else {
  //     tourPrice = {
  //       price: 0,
  //       adultprice: adultPrice ? parseFloat(adultPrice) : 0,
  //       kidprice: kidsPrice ? parseFloat(kidsPrice) : 0,
  //       pricetag: priceTag ? parseFloat(priceTag) : 0,
  //     };

  //     const hasAdultKids =
  //       (tourPrice.adultprice as number) > 0 ||
  //       (tourPrice.kidprice as number) > 0;
  //     const hasPriceTag = (tourPrice.pricetag as number) > 0;

  //     if (!hasAdultKids && !hasPriceTag) {
  //       alert("Please fill either Adult/Kids prices or the Price Tag.");
  //       return;
  //     }
  //   }
  //   function generateSlug(text: string) {
  //     return text
  //       .toLowerCase() // normalize to lowercase
  //       .trim() // remove leading/trailing spaces
  //       .replace(/[^a-z0-9\s-]/g, "") // remove anything that's not a-z, 0-9, space or dash
  //       .replace(/\s+/g, "-") // replace spaces with dash
  //       .replace(/-+/g, "-"); // collapse multiple dashes
  //   }

  //   const formData = {
  //     tourTitle: title,
  //     slugUrl: slug,
  //     tourDescription: description || null,
  //     tourDestination: destination,
  //     tourDuration: duration ? parseInt(duration) : 1,
  //     imageUrl: imageUrl,
  //     tourDocumentUrl: documentUrl || null,
  //     tourPrice,
  //     included: included.filter(Boolean),
  //     excluded: excluded.filter(Boolean),
  //     tourPlanDays: days.map((d) => ({
  //       dayNumber: d.dayNumber,
  //       title: d.title || null,
  //       description: d.description || null,
  //       items: d.items.filter(Boolean),
  //       boldtext: d.boldtext || null,
  //     })),
  //   };

  //   try {
  //     const response = await fetch("/api/tours/add", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       alert(result.message || "Failed to create tour");
  //       return;
  //     }

  //     alert("Tour created successfully!");
  //     router.push("/admin/tours");
  //   } catch (error) {
  //     console.error("Error creating tour:", error);
  //     alert("Something went wrong while creating the tour.");
  //   }
  //   router.push("/admin/tours");
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build the JSON parts as strings
    const tourPriceObj = advancedPricing
      ? {
          price: 0,
          adultprice: adultPrice ? parseFloat(adultPrice) : 0,
          kidprice: kidsPrice ? parseFloat(kidsPrice) : 0,
          pricetag: priceTag ? parseFloat(priceTag) : 0,
        }
      : {
          price: parseFloat(standardPrice) || 0,
          adultprice: 0,
          kidprice: 0,
          pricetag: 0,
        };

    const includedFiltered = included.filter(Boolean);
    const excludedFiltered = excluded.filter(Boolean);
    const tourPlanDaysFiltered = days.map((d) => ({
      dayNumber: d.dayNumber,
      title: d.title || null,
      description: d.description || null,
      items: d.items.filter(Boolean),
      boldtext: d.boldtext || null,
    }));

    // Create FormData and append fields
    const formData = new FormData();
    formData.append("slugUrl", slug);
    formData.append("tourTitle", title);
    formData.append("tourDestination", destination);
    if (description) formData.append("tourDescription", description);
    if (duration) formData.append("tourDuration", duration);
    formData.append("included", JSON.stringify(includedFiltered));
    formData.append("excluded", JSON.stringify(excludedFiltered));
    formData.append("tourPrice", JSON.stringify(tourPriceObj));
    formData.append("tourPlanDays", JSON.stringify(tourPlanDaysFiltered));

    // Append files if selected
    if (imageFile) formData.append("image", imageFile);
    if (documentFile) formData.append("document", documentFile);

    try {
      const response = await fetch("/api/tours/add", {
        method: "POST",
        body: formData, // no Content-Type header – browser sets it with boundary
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to create tour");
        return;
      }

      alert("Tour created successfully!");
      // router.push("/admin/tours");
    } catch (error) {
      console.error("Error creating tour:", error);
      alert("Something went wrong while creating the tour.");
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
          <h1 className="text-2xl font-bold text-foreground">Add New Tour</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 ">
                <Label>Tour Image</Label>
                <input
                  className="border border-black px-3 py-1 rounded"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="mt-2 max-h-40 rounded-md"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Tour Document</Label>
                <input
                  className="border border-black px-3 py-1 rounded"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, "document")}
                />
                {documentUrl && <p className="mt-1 text-sm">{documentUrl}</p>}
              </div>
            </div>
          </section>

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

          <div className="flex justify-end gap-3 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/tours")}
            >
              Cancel
            </Button>
            <Button type="submit">Create Tour</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTourForm;
