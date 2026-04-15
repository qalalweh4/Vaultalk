import { Router, type IRouter } from "express";
import * as crypto from "crypto";

const router: IRouter = Router();

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  sellerName: string;
  sellerUsername: string;
  vaultalkUsername: string;
  condition: "new" | "used" | "refurbished";
  location: string;
  images: string[];
  createdAt: Date;
  views: number;
}

const listings = new Map<string, Listing>();

// Seed with sample data
function seed() {
  const items: Omit<Listing, "id" | "createdAt" | "views">[] = [
    {
      title: "iPhone 15 Pro Max 256GB",
      description: "Excellent condition, barely used. Comes with original box and all accessories. Battery health 98%. Natural Titanium color.",
      price: 3800,
      currency: "SAR",
      category: "electronics",
      sellerName: "Mohammed Al-Ghamdi",
      sellerUsername: "mghamdi",
      vaultalkUsername: "sara2",
      condition: "used",
      location: "Riyadh",
      images: ["https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg"],
    },
    {
      title: "Arabic Calligraphy Logo Design",
      description: "Professional Arabic calligraphy logo design for your brand. 3 concepts, unlimited revisions, all source files included. 3-5 day delivery.",
      price: 500,
      currency: "SAR",
      category: "services",
      sellerName: "Sara Mohammed",
      sellerUsername: "sara_designs",
      vaultalkUsername: "sara2",
      condition: "new",
      location: "Jeddah",
      images: [],
    },
    {
      title: "MacBook Pro M3 14\" - Space Black",
      description: "Brand new, sealed box. M3 chip with 18GB RAM and 512GB SSD. International warranty. Bought from Apple Store US.",
      price: 6500,
      currency: "SAR",
      category: "electronics",
      sellerName: "Khalid Bin Laden",
      sellerUsername: "k_binladen",
      vaultalkUsername: "",
      condition: "new",
      location: "Dammam",
      images: [],
    },
    {
      title: "E-commerce Website Development",
      description: "Full stack e-commerce website with admin dashboard, payment gateway integration (Mada, Visa, Apple Pay), and mobile-responsive design. Built on Next.js.",
      price: 4500,
      currency: "SAR",
      category: "services",
      sellerName: "Fatima Al-Zahrani",
      sellerUsername: "fatima_dev",
      vaultalkUsername: "sara2",
      condition: "new",
      location: "Riyadh",
      images: [],
    },
    {
      title: "Toyota Land Cruiser GXR 2022",
      description: "Full option, Saudi specs. 5.7L V8 engine. One owner, no accidents. Service history available. 45,000 km.",
      price: 185000,
      currency: "SAR",
      category: "cars",
      sellerName: "Hamad Al-Otaibi",
      sellerUsername: "hamad99",
      vaultalkUsername: "sara2",
      condition: "used",
      location: "Mecca",
      images: [],
    },
    {
      title: "Brand Identity Package",
      description: "Complete brand identity including logo, color palette, typography, business card, letterhead, and brand guidelines document. SVG + PDF deliverables.",
      price: 1200,
      currency: "SAR",
      category: "services",
      sellerName: "Nora Al-Qahtani",
      sellerUsername: "nora_creative",
      vaultalkUsername: "sara2",
      condition: "new",
      location: "Riyadh",
      images: [],
    },
    {
      title: "Samsung Galaxy S24 Ultra 512GB",
      description: "Like new condition. Titanium Black. S-Pen included. No scratches. Saudi warranty until 2026.",
      price: 4200,
      currency: "SAR",
      category: "electronics",
      sellerName: "Omar Abdulaziz",
      sellerUsername: "omar_tech",
      vaultalkUsername: "sara2",
      condition: "used",
      location: "Jeddah",
      images: [],
    },
    {
      title: "Social Media Management (3 months)",
      description: "Monthly social media management for Instagram, Twitter, Snapchat. Content creation, scheduling, engagement, and monthly analytics report.",
      price: 2500,
      currency: "SAR",
      category: "services",
      sellerName: "Lama Al-Shehri",
      sellerUsername: "lama_social",
      vaultalkUsername: "sara2",
      condition: "new",
      location: "Riyadh",
      images: [],
    },
  ];

  items.forEach((item) => {
    const id = crypto.randomUUID();
    listings.set(id, {
      ...item,
      id,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 300) + 10,
    });
  });
}

seed();

// GET /api/market/listings
router.get("/market/listings", (req, res): void => {
  const { category, q, sort } = req.query as Record<string, string>;
  let all = Array.from(listings.values());

  if (category && category !== "all") {
    all = all.filter((l) => l.category === category);
  }
  if (q) {
    const lower = q.toLowerCase();
    all = all.filter(
      (l) =>
        l.title.toLowerCase().includes(lower) ||
        l.description.toLowerCase().includes(lower) ||
        l.category.toLowerCase().includes(lower),
    );
  }

  if (sort === "price_asc") all.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") all.sort((a, b) => b.price - a.price);
  else all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // newest first

  res.json({ listings: all, total: all.length });
});

// GET /api/market/listings/:id
router.get("/market/listings/:id", (req, res): void => {
  const listing = listings.get(req.params.id);
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  listing.views++;
  res.json({ listing });
});

// POST /api/market/listings
router.post("/market/listings", (req, res): void => {
  const {
    title, description, price, currency, category,
    sellerName, sellerUsername, vaultalkUsername,
    condition, location, images,
  } = req.body ?? {};

  if (!title || !price || !sellerName) {
    res.status(400).json({ error: "title, price, and sellerName are required" });
    return;
  }

  const id = crypto.randomUUID();
  const listing: Listing = {
    id,
    title: String(title),
    description: String(description ?? ""),
    price: Number(price),
    currency: String(currency ?? "SAR"),
    category: String(category ?? "other"),
    sellerName: String(sellerName),
    sellerUsername: String(sellerUsername ?? ""),
    vaultalkUsername: String(vaultalkUsername ?? ""),
    condition: (condition as Listing["condition"]) ?? "used",
    location: String(location ?? ""),
    images: Array.isArray(images) ? images : [],
    createdAt: new Date(),
    views: 0,
  };

  listings.set(id, listing);
  res.status(201).json({ listing });
});

// DELETE /api/market/listings/:id
router.delete("/market/listings/:id", (req, res): void => {
  if (!listings.has(req.params.id)) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  listings.delete(req.params.id);
  res.json({ success: true });
});

export default router;
