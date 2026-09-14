export type MicrositeContentItem = {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  alt?: string;
  link?: string;
  type?: string;
  sortOrder: number;
  area?: string;
  priceFrom?: string;
  date?: string;
  [key: string]: any;
};

export type MicrositeSection = {
  title?: string;
  description?: string;
  enabled?: boolean;
  items?: MicrositeContentItem[];
  [key: string]: any;
};

export type GalleryItem = {
  id: string;
  image: string;
  caption?: string;
  alt?: string;
  sortOrder: number;
};

export type VideoItem = {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  alt?: string;
  type: "YOUTUBE" | "TOUR_360" | "VIDEO";
  sortOrder: number;
};
