
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  image: string; // URL to image
  rating: number;
  reviewsCount: number;
  tags?: string[];
}
