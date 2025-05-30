import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn utility function to conditionally join CSS class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
