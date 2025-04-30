import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
// This file provides utility functions for common tasks:
// 1. `cn`: Combines multiple class names using `clsx` and merges them with `tailwind-merge`.
//    - Useful for conditionally applying Tailwind CSS classes.
// 2. `formatDate`: Formats a given date into a human-readable string in the "day month year" format.
//    - Uses the "en-IN" locale (e.g., "15 August 2023").