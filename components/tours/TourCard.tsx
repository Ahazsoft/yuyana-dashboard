import {
  MapPin,
  Clock,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TourCardProps {
  tour: {
    id: string;
    imageUrl: string | null;
    tourTitle: string;
    tourDestination: string;
    tourDuration: number | null;
    tourDescription: string | null;
    isPublished: boolean;
    tourPrice: any;
    _count?: {
      bookings: number;
    };
    included?: string[];
  };
}

const TourCard = ({ tour }: TourCardProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const price = tour.tourPrice as Record<string, number> | null;

  const displayPrice = () => {
    if (!price) return "$0";

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

  const handleEdit = () => {
    router.push(`/admin/tours/edit/${tour.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tours/edit/${tour.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete tour");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const rating = tour._count?.bookings ? 4.5 : 0;

  return (
    <>
      <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        {/* Row 1: Image */}
        <div className="relative aspect-video bg-muted">
          {tour.imageUrl ? (
            <img
              src={tour.imageUrl}
              alt={tour.tourTitle}
              className="h-full w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
              onClick={handleEdit}
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-muted-foreground cursor-pointer"
              onClick={handleEdit}
            >
              <ImageIcon className="h-10 w-10 opacity-30" />
            </div>
          )}

          {/* Diagonal Badge - Top Left */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md overflow-hidden pointer-events-none bg-yellow-50">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

              <span className="text-sm text-dark font-medium">
                {rating > 0 ? rating.toFixed(1) : "5"}
              </span>
            </div>
          </div>

          {/* More Options Menu - Top Right */}
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Booking Count Badge */}
          {tour._count?.bookings ? (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {tour._count.bookings} booking
              {tour._count.bookings !== 1 ? "s" : ""}
            </div>
          ) : null}
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3">
          {/* Row 2: Location & Days */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tour.tourDestination}</span>
            </div>
            {tour.tourDuration && (
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="h-3.5 w-3.5" />
                <span>{tour.tourDuration} days</span>
              </div>
            )}
          </div>

          {/* Row 3: Title */}
          <div className="flex items-center gap-3">
            <h3
              className="font-semibold text-lg leading-tight line-clamp-1 cursor-pointer hover:text-primary transition-colors"
              onClick={handleEdit}
            >
              {tour.tourTitle}
            </h3>
            {tour.isPublished ? (
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            ) : (
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            )}
          </div>

          {/* Row 4: Description (2 lines) & Included count */}
          <div className="flex items-start justify-between gap-2">
            {tour.tourDescription ? (
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {tour.tourDescription}
              </p>
            ) : (
              <div className="flex-1" />
            )}
            {/* {tour.included && tour.included.length > 0 && (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                +{tour.included.length} included
              </span>
            )} */}
          </div>

          {/* Row 5: Rating & Price */}
          <div className="flex items-center gap-3 pt-2">
            <h3 className="text-md ">Price :</h3>
            {displayPrice() && (
              <span className="text-lg font-bold text-primary">
                {displayPrice()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tour</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{tour.tourTitle}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TourCard;
