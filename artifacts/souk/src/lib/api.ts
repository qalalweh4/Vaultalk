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
  createdAt: string;
  views: number;
}

export async function fetchListings(params?: { category?: string, q?: string, sort?: string }): Promise<{ listings: Listing[], total: number }> {
  const url = new URL("/api/market/listings", window.location.origin);
  if (params?.category && params.category !== "all") url.searchParams.set("category", params.category);
  if (params?.q) url.searchParams.set("q", params.q);
  if (params?.sort) url.searchParams.set("sort", params.sort);
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function fetchListing(id: string): Promise<{ listing: Listing }> {
  const res = await fetch(`/api/market/listings/${id}`);
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}

export async function createListing(data: Omit<Listing, "id" | "createdAt" | "views">): Promise<{ listing: Listing }> {
  const res = await fetch("/api/market/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create listing");
  return res.json();
}
