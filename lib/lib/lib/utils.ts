import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const taskCategories = [
  "Live Show",
  "Recording",
  "Mix & Master",
  "Session",
  "Production",
  "Promotion"
];

export const budgetTypes = ["fixed", "range", "collab"] as const;
