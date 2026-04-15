import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { fetchListing } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Shield, MapPin, Clock, Tag, Eye, Info, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id!),
    enabled: !!id
  });

  if (isLoading) {
    return <Layout><div className="container py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></Layout>;
  }

  if (error || !data) {
    return <Layout><div className="container py-12 text-center text-destructive">Failed to load listing</div></Layout>;
  }

  const { listing } = data;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[4/3] bg-muted rounded-3xl overflow-hidden border flex items-center justify-center">
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="object-contain w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                  <Tag className="h-24 w-24 text-primary/20" />
                </div>
              )}
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 border shadow-sm space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="bg-muted px-3 py-1 rounded-full font-medium capitalize flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {listing.category}
                </span>
                <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  listing.condition === 'new' ? 'bg-green-100 text-green-800' :
                  listing.condition === 'used' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {listing.condition}
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">{listing.title}</h1>
                <p className="text-3xl md:text-5xl font-black text-primary">
                  {listing.price.toLocaleString()} <span className="text-xl font-semibold">{listing.currency}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase font-semibold flex items-center gap-1"><MapPin className="h-3 w-3"/> Location</span>
                  <span className="font-medium">{listing.location}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase font-semibold flex items-center gap-1"><Clock className="h-3 w-3"/> Listed</span>
                  <span className="font-medium">{formatDistanceToNow(new Date(listing.createdAt))} ago</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase font-semibold flex items-center gap-1"><Eye className="h-3 w-3"/> Views</span>
                  <span className="font-medium">{listing.views}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase font-semibold flex items-center gap-1"><User className="h-3 w-3"/> Seller</span>
                  <span className="font-medium">@{listing.sellerUsername}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Description
                </h3>
                <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground whitespace-pre-wrap">
                  {listing.description}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 border shadow-sm sticky top-24">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {listing.sellerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">{listing.sellerName}</p>
                  <p className="text-sm text-muted-foreground">@{listing.sellerUsername}</p>
                </div>
              </div>

              {listing.vaultalkUsername ? (
                <div className="space-y-4">
                  <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl flex items-start gap-3">
                    <Shield className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-secondary-foreground text-sm">Vaultalk Escrow Ready</p>
                      <p className="text-xs text-muted-foreground mt-1">This seller accepts secure payments via Vaultalk AI-escrow.</p>
                    </div>
                  </div>
                  
                  <a 
                    href={`/pay?seller=${listing.vaultalkUsername}&amount=${listing.price}&description=${encodeURIComponent(listing.title)}`}
                    className="block w-full"
                  >
                    <Button size="lg" className="w-full text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl overflow-hidden relative group">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        <Shield className="h-5 w-5" /> Negotiate with Vaultalk
                      </span>
                    </Button>
                  </a>
                  
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Safe Transaction via Vaultalk
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button size="lg" className="w-full rounded-xl" variant="outline">
                    Contact Seller
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">This seller hasn't enabled Vaultalk escrow.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

