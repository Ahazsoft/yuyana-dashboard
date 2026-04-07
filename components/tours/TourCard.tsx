import { MapPin, Clock, Star } from "lucide-react";
import Link from "next/link";

const TourCard = ({ tour }: { tour: any }) => {
  const price = tour.tourPrice as Record<string, number> | null;

  const displayPrice = () => {
    if (!price) return null;

    const normal = Number(price.price ?? 0);
    const adult = Number(price.adultprice ?? 0);
    const kid = Number(price.kidprice ?? 0);
    const tag = Number(price.pricetag ?? 0);

    if (normal > 0 && adult === 0 && kid === 0 && tag === 0) {
      return `$${normal.toLocaleString()}`;
    }

    const parts: string[] = [];
    if (adult > 0) parts.push(`Adult: $${adult.toLocaleString()}`);
    if (kid > 0) parts.push(`Kid: $${kid.toLocaleString()}`);
    if (tag > 0) parts.push(`$${tag.toLocaleString()}`);

    return parts.join(" | ") || null;
  };

  return (
    <Link
      href={`/admin/tours/edit/${tour.id}`}
      className="group block rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <MapPin className="h-8 w-8 opacity-30" />
          </div>
        )}
        {/* Published badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              tour.isPublished
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {tour.isPublished ? "Published" : "Draft"}
          </span>
        </div>
        {tour._count?.bookings > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-card/90 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {tour._count.bookings} bookings
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {tour.tourTitle}
        </h3>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{tour.tourDestination}</span>
        </div>

        {tour.tourDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {tour.tourDescription}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-2">
          {tour.tourDuration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {tour.tourDuration} days
            </span>
          )}
          {displayPrice() && (
            <span className="text-base font-bold text-primary">
              {displayPrice()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
