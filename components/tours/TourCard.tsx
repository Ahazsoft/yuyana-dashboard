import { MapPin, Clock, Star } from "lucide-react";
import type { TourPackage } from "@/app/data/mockTours";
import Link from "next/link";

interface TourCardProps {
  tour: TourPackage;
}

const TourCard = ({ tour }: TourCardProps) => {
  const price = tour.tourPrice as Record<string, number> | null;
  const displayPrice = price?.price ?? null;

  return (
    <Link
      href={`/admin/tours/edit/${tour.id}`}
      className="group block rounded-lg border border-border bg-card overflow-hidden tour-card-hover"
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {tour.imageUrl ? (
          <img
            src={tour.imageUrl}
            alt={tour.tourTitle}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
        {tour.tourRating && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-card/90 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-success text-success" />
            {tour.tourRating}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
          {tour.tourTitle}
        </h3>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{tour.tourDestination}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          {tour.tourDuration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {tour.tourDuration} days
            </span>
          )}
          {displayPrice !== null && (
            <span className="text-lg font-bold text-success">
              ${displayPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
