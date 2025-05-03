import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return "N/A";
  
  try {
    return `﷼${amount.toFixed(2)}`;
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "Invalid Amount";
  }
}
