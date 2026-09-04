export type GalleryCategory = "house" | "kitchen" | "yard" | "mountain" | "pool";

export interface GalleryImage {
  /** Stable key into dictionary.gallery.altTexts — the filename stem. */
  id: string;
  src: string;
  category: GalleryCategory;
}

export const galleryImages: GalleryImage[] = [
  { id: "house-1", src: "/gallery/house/house-1.jpg", category: "house" },
  { id: "house-2", src: "/gallery/house/house-2.jpg", category: "house" },
  { id: "house-3", src: "/gallery/house/house-3.jpg", category: "house" },
  { id: "house-4", src: "/gallery/house/house-4.jpg", category: "house" },
  { id: "house-5", src: "/gallery/house/house-5.jpg", category: "house" },
  { id: "house-6", src: "/gallery/house/house-6.jpg", category: "house" },
  { id: "house-7", src: "/gallery/house/house-7.jpg", category: "house" },
  { id: "house-8", src: "/gallery/house/house-8.jpg", category: "house" },
  { id: "house-9", src: "/gallery/house/house-9.jpg", category: "house" },
  { id: "house-10", src: "/gallery/house/house-10.jpg", category: "house" },

  { id: "kitchen-1", src: "/gallery/kitchen/kitchen-1.jpg", category: "kitchen" },
  { id: "kitchen-2", src: "/gallery/kitchen/kitchen-2.jpg", category: "kitchen" },
  { id: "kitchen-3", src: "/gallery/kitchen/kitchen-3.jpg", category: "kitchen" },
  { id: "kitchen-4", src: "/gallery/kitchen/kitchen-4.jpg", category: "kitchen" },
  { id: "kitchen-5", src: "/gallery/kitchen/kitchen-5.jpg", category: "kitchen" },
  { id: "kitchen-6", src: "/gallery/kitchen/kitchen-6.jpg", category: "kitchen" },
  { id: "kitchen-7", src: "/gallery/kitchen/kitchen-7.jpg", category: "kitchen" },
  { id: "kitchen-8", src: "/gallery/kitchen/kitchen-8.jpg", category: "kitchen" },
  { id: "kitchen-9", src: "/gallery/kitchen/kitchen-9.jpg", category: "kitchen" },
  { id: "kitchen-10", src: "/gallery/kitchen/kitchen-10.jpg", category: "kitchen" },
  { id: "kitchen-11", src: "/gallery/kitchen/kitchen-11.jpg", category: "kitchen" },
  // New this round (perf/content: gallery photo update). Ordered strongest
  // first, then a deliberate "process" sequence at the end per Kristian's
  // note: grill embers -> oven embers -> oven roast -> lamb -> pork.
  // oven-embers-2.jpg and oven-roast-2.jpg exist on disk but were left out
  // of the gallery on purpose (near-duplicate of oven-embers-1 / meat still
  // looked raw under the lamp) — not deleted, just not listed here.
  { id: "pizza-1", src: "/gallery/kitchen/pizza-1.jpg", category: "kitchen" },
  { id: "homemade-bread-1", src: "/gallery/kitchen/homemade-bread-1.jpg", category: "kitchen" },
  { id: "burger-1", src: "/gallery/kitchen/burger-1.jpg", category: "kitchen" },
  { id: "cured-ham-winter-1", src: "/gallery/kitchen/cured-ham-winter-1.jpg", category: "kitchen" },
  { id: "dining-hall-1", src: "/gallery/kitchen/dining-hall-1.jpg", category: "kitchen" },
  { id: "terrace-table-1", src: "/gallery/kitchen/terrace-table-1.jpg", category: "kitchen" },
  { id: "grill-embers-1", src: "/gallery/kitchen/grill-embers-1.jpg", category: "kitchen" },
  { id: "oven-embers-1", src: "/gallery/kitchen/oven-embers-1.jpg", category: "kitchen" },
  { id: "oven-roast-1", src: "/gallery/kitchen/oven-roast-1.jpg", category: "kitchen" },
  { id: "roast-lamb-1", src: "/gallery/kitchen/roast-lamb-1.jpg", category: "kitchen" },
  { id: "roast-pork-1", src: "/gallery/kitchen/roast-pork-1.jpg", category: "kitchen" },

  { id: "yard-1", src: "/gallery/yard/yard-1.jpg", category: "yard" },
  { id: "yard-2", src: "/gallery/yard/yard-2.jpg", category: "yard" },
  // New this round. pool-barbecue-1.jpg shows the pool too, but Kristian
  // chose to keep it single-category (yard, matching its folder) rather
  // than double-listing it under pool as well.
  { id: "yard-winter-1", src: "/gallery/yard/yard-winter-1.jpg", category: "yard" },
  { id: "yard-winter-3", src: "/gallery/yard/yard-winter-3.jpg", category: "yard" },
  { id: "pool-barbecue-1", src: "/gallery/yard/pool-barbecue-1.jpg", category: "yard" },

  { id: "mountain-1", src: "/gallery/mountain/mountain-1.jpg", category: "mountain" },
  { id: "mountain-2", src: "/gallery/mountain/mountain-2.jpg", category: "mountain" },
  // New this round.
  { id: "rila-valley-1", src: "/gallery/mountain/rila-valley-1.jpg", category: "mountain" },
  { id: "viewpoint-1", src: "/gallery/mountain/viewpoint-1.jpg", category: "mountain" },
  { id: "rila-trail-1", src: "/gallery/mountain/rila-trail-1.jpg", category: "mountain" },
  { id: "mountain-river-1", src: "/gallery/mountain/mountain-river-1.jpg", category: "mountain" },
  { id: "forest-stream-1", src: "/gallery/mountain/forest-stream-1.jpg", category: "mountain" },
  { id: "forest-river-2", src: "/gallery/mountain/forest-river-2.jpg", category: "mountain" },
  { id: "forest-river-3", src: "/gallery/mountain/forest-river-3.jpg", category: "mountain" },
  { id: "mountain-river-2", src: "/gallery/mountain/mountain-river-2.jpg", category: "mountain" },
  { id: "river-spring-1", src: "/gallery/mountain/river-spring-1.jpg", category: "mountain" },
  { id: "rila-meadow-1", src: "/gallery/mountain/rila-meadow-1.jpg", category: "mountain" },
  { id: "meadow-sunrise-1", src: "/gallery/mountain/meadow-sunrise-1.jpg", category: "mountain" },
  { id: "meadow-sun-1", src: "/gallery/mountain/meadow-sun-1.jpg", category: "mountain" },
  { id: "meadow-trees-1", src: "/gallery/mountain/meadow-trees-1.jpg", category: "mountain" },
  { id: "meadow-village-1", src: "/gallery/mountain/meadow-village-1.jpg", category: "mountain" },
  { id: "forest-river-1", src: "/gallery/mountain/forest-river-1.jpg", category: "mountain" },
  { id: "mushrooms-crate-1", src: "/gallery/mountain/mushrooms-crate-1.jpg", category: "mountain" },
  { id: "mushroom-1", src: "/gallery/mountain/mushroom-1.jpg", category: "mountain" },

  { id: "pool-1", src: "/gallery/pool/pool-1.jpg", category: "pool" },
  { id: "pool-2", src: "/gallery/pool/pool-2.jpg", category: "pool" },
];
