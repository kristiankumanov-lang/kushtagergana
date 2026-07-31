export type GalleryCategory = "house" | "kitchen" | "yard" | "mountain" | "pool";

export interface GalleryImage {
  src: string;
  category: GalleryCategory;
}

export const galleryImages: GalleryImage[] = [
  { src: "/gallery/house/house-1.jpg", category: "house" },
  { src: "/gallery/house/house-2.jpg", category: "house" },
  { src: "/gallery/house/house-3.jpg", category: "house" },
  { src: "/gallery/house/house-4.jpg", category: "house" },
  { src: "/gallery/house/house-5.jpg", category: "house" },
  { src: "/gallery/house/house-6.jpg", category: "house" },
  { src: "/gallery/house/house-7.jpg", category: "house" },
  { src: "/gallery/house/house-8.jpg", category: "house" },
  { src: "/gallery/house/house-9.jpg", category: "house" },
  { src: "/gallery/house/house-10.jpg", category: "house" },
  { src: "/gallery/kitchen/kitchen-1.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-2.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-3.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-4.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-5.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-6.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-7.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-8.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-9.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-10.jpg", category: "kitchen" },
  { src: "/gallery/kitchen/kitchen-11.jpg", category: "kitchen" },
  { src: "/gallery/yard/yard-1.jpg", category: "yard" },
  { src: "/gallery/yard/yard-2.jpg", category: "yard" },
  { src: "/gallery/mountain/mountain-1.jpg", category: "mountain" },
  { src: "/gallery/mountain/mountain-2.jpg", category: "mountain" },
  { src: "/gallery/pool/pool-1.jpg", category: "pool" },
  { src: "/gallery/pool/pool-2.jpg", category: "pool" },
];
