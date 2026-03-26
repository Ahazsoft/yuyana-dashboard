"use client";

import Image from "next/image";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tour } from "@/lib/types";

interface TourCardProps {
  tour: Tour;
  onEdit?: (tour: Tour) => void;
}

export function TourCard({ tour, onEdit }: TourCardProps) {
  return (
    <Card className='overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-card/50 backdrop-blur-sm'>
      <div className='relative aspect-[4/3] overflow-hidden'>
        {/* Placeholder for image - using a colored div if image fails or for now */}
        <div className='absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground'>
          {tour.image ? (
            <Image
              src={tour.image}
              alt={tour.title}
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-500'
            />
          ) : (
            <MapPin className='w-12 h-12 opacity-20' />
          )}
        </div>
        <div className='absolute top-3 right-3 flex flex-col gap-2'>
          <Badge
            variant='secondary'
            className='backdrop-blur-md bg-black/30 text-white border-none hover:bg-black/40'>
            {tour.duration}
          </Badge>
          {onEdit && (
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-primary shadow-sm"
              onClick={() => onEdit(tour)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </Button>
          )}
        </div>
      </div>

      <CardHeader className='p-4 pb-2'>
        <div className='flex justify-between items-start mb-2'>
          <Badge
            variant='outline'
            className='text-xs font-normal text-muted-foreground border-primary/20'>
            {tour.tags?.[0] || "Tour"}
          </Badge>
          <div className='flex items-center gap-1 text-amber-500'>
            <Star className='w-3.5 h-3.5 fill-current' />
            <span className='text-xs font-medium'>{tour.rating}</span>
            <span className='text-xs text-muted-foreground'>
              ({tour.reviewsCount})
            </span>
          </div>
        </div>
        <h3 className='font-bold text-lg leading-tight group-hover:text-primary transition-colors'>
          {tour.title}
        </h3>
        <div className='flex items-center text-muted-foreground text-sm mt-1'>
          <MapPin className='w-3.5 h-3.5 mr-1' />
          {tour.location}
        </div>
      </CardHeader>

      <CardContent className='p-4 pt-0'>
        <p className='text-sm text-muted-foreground line-clamp-2 mt-2'>
          {tour.description}
        </p>
      </CardContent>

      <CardFooter className='p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-auto pt-4'>
        <div>
          <p className='text-xs text-muted-foreground'>Starting from</p>
          <p className='text-xl font-bold text-primary'>{tour.price} ETB</p>
        </div>
        {/* <Button size="sm" className="rounded-full px-4 group/btn">
          Book Now
          <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button> */}
      </CardFooter>
    </Card>
  );
}
