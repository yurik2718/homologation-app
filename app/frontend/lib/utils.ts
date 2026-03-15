import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cached once at module load — CSRF token doesn't change during a page session
export const csrfToken: string =
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? ""
