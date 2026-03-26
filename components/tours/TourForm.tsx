"use client";
import { useState } from "react";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { TourPackage } from "@/app/data/mockTours";
import { useRouter } from "next/navigation";

interface TourFormProps {
  initialData?: TourPackage;
  mode: "create" | "edit";
}

interface DayForm {
  dayNumber: number;
  title: string;
  description: string;
  items: string[];
  boldtext: string;
}

const TourForm = ({ initialData, mode }: TourFormProps) => {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Basic fields
  const [title, setTitle] = useState(initialData?.tourTitle ?? "");
  const [slug, setSlug] = useState(initialData?.slugUrl ?? "");
  const [description, setDescription] = useState(
    initialData?.tourDescription ?? "",
  );
  const [destination, setDestination] = useState(
    initialData?.tourDestination ?? "",
  );
  const [duration, setDuration] = useState<string>(
    initialData?.tourDuration?.toString() ?? "",
  );
  const [rating, setRating] = useState<string>(
    initialData?.tourRating?.toString() ?? "",
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [documentUrl, setDocumentUrl] = useState(
    initialData?.tourDocumentUrl ?? "",
  );
  const [included, setIncluded] = useState<string[]>(
    initialData?.included?.length ? initialData.included : [""],
  );
  const [excluded, setExcluded] = useState<string[]>(
    initialData?.excluded?.length ? initialData.excluded : [""],
  );

  // Pricing
  const initPrice = initialData?.tourPrice as Record<string, unknown> | null;
  const [advancedPricing, setAdvancedPricing] = useState(() => {
    return initPrice ? Object.keys(initPrice).length > 1 : false;
  });

  // Default price (simple mode)
  const [standardPrice, setStandardPrice] = useState<string>(
    initPrice?.price?.toString() ?? "",
  );

  // Advanced pricing fields
  const [adultPrice, setAdultPrice] = useState<string>(
    initPrice?.adultprice?.toString() ?? "",
  );
  const [kidsPrice, setKidsPrice] = useState<string>(
    initPrice?.kidprice?.toString() ?? "",
  );
  const [priceTag, setPriceTag] = useState<string>(
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

  const updateDay = (idx: number, field: keyof DayForm, value: unknown) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build price object based on mode
    let tourPrice: Record<string, unknown> = {};

    if (!advancedPricing) {
      // Simple mode – only price field
      tourPrice = { price: parseFloat(standardPrice) || 0 };
    } else {
      // Advanced mode – include all fields, default to 0 if empty
      tourPrice = {
        price: 0, // always include with default 0
        adultprice: adultPrice ? parseFloat(adultPrice) : 0,
        kidprice: kidsPrice ? parseFloat(kidsPrice) : 0,
        pricetag: priceTag ? parseFloat(priceTag) : 0,
      };

      // Optional: validate that at least one of adult+ kids or priceTag has a value > 0
      const hasAdultKids =
        (tourPrice.adultprice as number) > 0 ||
        (tourPrice.kidprice as number) > 0;
      const hasPriceTag = (tourPrice.pricetag as number) > 0;
      if (!hasAdultKids && !hasPriceTag) {
        alert("Please fill either Adult/Kids prices or the Price Tag.");
        return;
      }
    }

    const formData = {
      tourTitle: title,
      slugUrl: slug,
      tourDescription: description || null,
      tourDestination: destination,
      tourDuration: duration ? parseInt(duration) : null,
      tourRating: rating ? parseFloat(rating) : null,
      imageUrl: imageUrl || null,
      tourDocumentUrl: documentUrl || null,
      tourPrice,
      included: included.filter(Boolean),
      excluded: excluded.filter(Boolean),
      tourPlanDays: days.map((d) => ({
        dayNumber: d.dayNumber,
        title: d.title || null,
        description: d.description || null,
        items: d.items.filter(Boolean),
        boldtext: d.boldtext || null,
      })),
    };

    console.log("Form submitted:", formData);
    alert(
      `Tour ${isEdit ? "updated" : "created"} successfully! (check console for data)`,
    );
    router.push("/admin/tours");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
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
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit Tour" : "Add New Tour"}
          </h1>
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

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentUrl">Document URL (optional)</Label>
              <Input
                id="documentUrl"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://..."
              />
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
                  placeholder="e.g. 1200"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="adultPrice">
                      Adult Price ($) (optional)
                    </Label>
                    <Input
                      id="adultPrice"
                      type="number"
                      min={0}
                      step={0.01}
                      value={adultPrice}
                      onChange={(e) => setAdultPrice(e.target.value)}
                      placeholder="e.g. 800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kidsPrice">Kids Price ($) (optional)</Label>
                    <Input
                      id="kidsPrice"
                      type="number"
                      min={0}
                      step={0.01}
                      value={kidsPrice}
                      onChange={(e) => setKidsPrice(e.target.value)}
                      placeholder="e.g. 400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceTag">Price Tag ($) (optional)</Label>
                    <Input
                      id="priceTag"
                      type="number"
                      min={0}
                      step={0.01}
                      value={priceTag}
                      onChange={(e) => setPriceTag(e.target.value)}
                      placeholder="e.g. 1200"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fill either Adult + Kids <strong>or</strong> Price Tag. Empty
                  fields will be stored as 0.
                </p>
              </div>
            )}
          </section>

          {/* Included / Excluded */}
          <section className="space-y-4 rounded-lg border border-black bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Included & Excluded (optional)
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
                Itinerary (optional)
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
              <p className="text-sm text-muted-foreground py-4 text-center">
                No days added yet. Click "Add Day" to start building the
                itinerary.
              </p>
            )}

            <div className="space-y-4">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-black bg-background p-4 space-y-3"
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
                      <Label className="text-xs">Title (optional)</Label>
                      <Input
                        value={day.title}
                        onChange={(e) =>
                          updateDay(idx, "title", e.target.value)
                        }
                        placeholder="e.g. Arrival Day"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Important Note (optional)
                      </Label>
                      <Input
                        value={day.boldtext}
                        onChange={(e) =>
                          updateDay(idx, "boldtext", e.target.value)
                        }
                        placeholder="e.g. Highlight"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Description (optional)</Label>
                    <Textarea
                      value={day.description}
                      onChange={(e) =>
                        updateDay(idx, "description", e.target.value)
                      }
                      rows={2}
                      placeholder="What happens on this day..."
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
                          placeholder="e.g. Airport pickup"
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

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/tours")}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Tour" : "Create Tour"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourForm;
