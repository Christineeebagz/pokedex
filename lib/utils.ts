import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIdNum(id: number | undefined): string {
  // Handle undefined/null cases
  if (id === undefined || id === null) {
    console.warn(
      "formatIdNum: Received undefined/null ID, defaulting to '000'"
    );
    return "000";
  }

  // Handle numbers with 3+ digits (no padding needed)
  if (id >= 100) {
    return id.toString();
  }

  // Pad numbers below 100 with leading zeros
  return id.toString().padStart(3, "0");
}

export function capitalize(
  str: string | null | undefined,
  allWords: boolean = false
): string {
  if (!str) return "";

  if (allWords) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}
