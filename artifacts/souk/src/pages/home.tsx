import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Tag, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["all", "electronics", "services", "cars", "furniture", "clothing", "other"];

export function Home() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const { data, isLoading } = useQuery({
    queryKey: ["listings", category, search, sort],
    queryFn: () => fetchListings({ category, q: search, sort })
  });

  return (
    <Layout>
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Discover <span className="text-primary">Trusted</span> Deals
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            The modern Gulf marketplace. Every transaction can be secured via Vaultalk AI-escrow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="What are you looking for?" 
                className="pl-10 h-12 text-base rounded-xl bg-background border-primary/20 focus-visible:ring-primary/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-12 w-full sm:w-[180px] rounded-xl bg-background border-primary/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className="rounded-full capitalize whitespace-nowrap"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="bg-muted rounded-2xl aspect-square w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.listings.map(listing => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="group block">
                <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <Tag className="h-12 w-12 text-primary/30" />
                      </div>
                    )}
                    {listing.vaultalkUsername && (
                      <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        Escrow Ready
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                        listing.condition === 'new' ? 'bg-green-100 text-green-800' :
                        listing.condition === 'used' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {listing.condition}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">{listing.title}</h3>
                    <p className="text-xl font-bold text-primary mb-3">
                      {listing.price.toLocaleString()} <span className="text-sm font-normal">{listing.currency}</span>
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[80px]">{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {data?.listings.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No listings found in this category.</p>
                <Button variant="link" onClick={() => {setSearch(""); setCategory("all")}}>Clear filters</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
