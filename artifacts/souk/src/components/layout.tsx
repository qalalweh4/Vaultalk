import { Link } from "wouter";
import { Store, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Store className="h-6 w-6" />
            <span>Souk</span>
          </Link>
          
          <div className="flex-1 max-w-xl hidden md:flex items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="search" 
              placeholder="Search listings..." 
              className="w-full h-10 pl-10 pr-4 rounded-full border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/create">
              <Button size="sm" className="gap-2 rounded-full font-medium">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Sell Item</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-card border-t py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Souk Marketplace
          </p>
          <p className="text-sm">Safe, trusted transactions in the Gulf.</p>
        </div>
      </footer>
    </div>
  );
}
