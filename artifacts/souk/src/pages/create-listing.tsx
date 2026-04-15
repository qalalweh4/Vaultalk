import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createListing } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.enum(["electronics", "services", "cars", "furniture", "clothing", "other"]),
  condition: z.enum(["new", "used", "refurbished"]),
  location: z.string().min(2, "Location is required"),
  sellerName: z.string().min(2, "Name is required"),
  sellerUsername: z.string().min(2, "Username is required"),
  vaultalkUsername: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined as any,
      category: "electronics",
      condition: "new",
      location: "",
      sellerName: "Test User",
      sellerUsername: "testuser",
      vaultalkUsername: "",
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => createListing({
      ...data,
      currency: "SAR",
      images: [] // Handle images later if needed
    }),
    onSuccess: (data) => {
      toast({
        title: "Listing Created",
        description: "Your item is now live on Souk.",
      });
      setLocation(`/listing/${data.listing.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    }
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Store className="h-8 w-8 text-primary" /> Create Listing
          </h1>
          <p className="text-muted-foreground text-lg">Sell your item to thousands of buyers in the Gulf.</p>
        </div>

        <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Item Details</h3>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. iPhone 15 Pro Max 256GB" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (SAR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="cars">Cars</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                            <SelectItem value="refurbished">Refurbished</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Riyadh, Saudi Arabia" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your item in detail..." 
                          className="resize-none min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-secondary" /> Trust & Payments
                </h3>
                
                <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 mb-4">
                  <FormField
                    control={form.control}
                    name="vaultalkUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-secondary-foreground font-bold text-base">Vaultalk Username (Optional, but recommended)</FormLabel>
                        <FormControl>
                          <Input placeholder="your_vaultalk_handle" {...field} className="h-11 bg-white" />
                        </FormControl>
                        <FormDescription className="text-sm mt-2 text-muted-foreground">
                          Enter your Vaultalk seller username to enable the <strong>'Negotiate with Vaultalk'</strong> button on your listing. This allows buyers to pay you safely via AI-escrow.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button type="submit" size="lg" disabled={mutation.isPending} className="h-12 px-8 text-base rounded-xl font-bold">
                  {mutation.isPending ? "Creating..." : "Publish Listing"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
