"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UploadDropzone, UploadButton } from "@/lib/uploadthing-components";
import { CalendarIcon, X } from "lucide-react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Updated schema without the file validation since UploadThing handles that
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startPrice: z.number().min(1, "Starting price must be greater than 0"),
  endTime: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, "End time must be in the future"),
  itemType: z.enum(["IRON", "METAL", "ALUMINIUM"], {
    required_error: "Please select an item type",
  }),
  // Replace file validation with string URLs that we'll get from UploadThing
  images: z.array(z.string()).min(1, "At least one image is required"),
});

type FormData = z.infer<typeof formSchema> & {
  itemType: "IRON" | "METAL" | "ALUMINIUM";
};

export function CreateAuctionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startPrice: 0,
      endTime: "",
      images: [],
    },
  });

  useEffect(() => {
    console.log("uploadedImages", uploadedImages);
  }, [uploadedImages]);

  // Update form images field when uploads complete
  const updateFormImages = (imageUrls: string[]) => {
    setUploadedImages(imageUrls);
    form.setValue("images", imageUrls);
  };

  // Remove image from the list
  const removeImage = (imageUrl: string) => {
    const updatedImages = uploadedImages.filter((url) => url !== imageUrl);
    setUploadedImages(updatedImages);
    form.setValue("images", updatedImages);
  };

  // Add this function to debug UploadThing events
  const logUploadEvents = () => {
    console.log("UploadThing component mounted and events attached");
  };

  useEffect(() => {
    logUploadEvents();

    // Add global event listeners to catch any file input changes
    const handleFileInputChange = (e: Event) => {
      console.log("File input changed:", (e.target as HTMLInputElement)?.files);
    };

    document.addEventListener("change", (e) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" &&
        (e.target as HTMLInputElement).type === "file"
      ) {
        handleFileInputChange(e);
      }
    });

    return () => {
      document.removeEventListener("change", handleFileInputChange);
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Submit auction data directly with the image URLs
      const auctionResponse = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startPrice: Number(data.startPrice),
        }),
      });

      if (!auctionResponse.ok) {
        const errorData = await auctionResponse.json();
        throw new Error(errorData.error || "Failed to create auction");
      }

      toast.success("Auction created successfully!");
      router.push("/auctions");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Auction</CardTitle>
        <CardDescription>
          Fill in the details below to create your auction. All fields are
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter auction title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your item in detail"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IRON">Iron</SelectItem>
                      <SelectItem value="METAL">Metal</SelectItem>
                      <SelectItem value="ALUMINIUM">Aluminium</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value === 0 ? "" : field.value.toString()}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP p")
                          ) : (
                            <span>Select end date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            // For date selection, preserve any current time or set to current time
                            const currentDate = field.value
                              ? new Date(field.value)
                              : new Date();
                            date.setHours(
                              currentDate.getHours(),
                              currentDate.getMinutes()
                            );
                            field.onChange(date.toISOString());
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Time:</span>
                          <Input
                            type="time"
                            className="w-32"
                            value={
                              field.value
                                ? format(new Date(field.value), "HH:mm")
                                : ""
                            }
                            onChange={(e) => {
                              if (e.target.value && field.value) {
                                const [hours, minutes] =
                                  e.target.value.split(":");
                                const date = new Date(field.value);
                                date.setHours(
                                  parseInt(hours),
                                  parseInt(minutes)
                                );
                                field.onChange(date.toISOString());
                              } else if (e.target.value) {
                                const [hours, minutes] =
                                  e.target.value.split(":");
                                const date = new Date();
                                date.setHours(
                                  parseInt(hours),
                                  parseInt(minutes)
                                );
                                field.onChange(date.toISOString());
                              }
                            }}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auction Images</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Simplified uploader with better UI */}
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="mb-2">
                            <h4 className="text-sm font-medium">
                              Upload Item Photos
                            </h4>
                            <p className="text-sm text-gray-500">
                              Add up to 5 images of your item to showcase
                              details
                            </p>
                          </div>

                          {/* Only keep the working UploadThing button */}
                          <UploadButton
                            endpoint="imageUploader"
                            appearance={{
                              button:
                                "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md",
                              container: "w-full max-w-xs",
                            }}
                            onBeforeUploadBegin={(files) => {
                              console.log(
                                "Starting upload for files:",
                                files.length
                              );
                              setIsUploading(true);
                              return files;
                            }}
                            onClientUploadComplete={(res) => {
                              console.log("Upload succeeded!", res);
                              const imageUrls = res.map((file) => file.ufsUrl);
                              updateFormImages([
                                ...uploadedImages,
                                ...imageUrls,
                              ]);
                              toast.success(
                                `${imageUrls.length} images uploaded successfully!`
                              );
                              setIsUploading(false);
                            }}
                            onUploadError={(error: Error) => {
                              console.error("Upload failed:", error);
                              toast.error(`Upload Error: ${error.message}`);
                              setIsUploading(false);
                            }}
                          />
                        </div>
                      </div>

                      {isUploading && (
                        <div className="flex justify-center items-center py-4">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                          <p>Uploading images...</p>
                        </div>
                      )}

                      {/* Preview uploaded images */}
                      {uploadedImages.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Uploaded Images ({uploadedImages.length})
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {uploadedImages.map((url, idx) => (
                              <div
                                key={idx}
                                className="relative rounded-md overflow-hidden h-24 border border-gray-200 group"
                              >
                                <Image
                                  src={url}
                                  alt={`Uploaded image ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(url)}
                                  className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </div>
              ) : (
                "Create Auction"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
