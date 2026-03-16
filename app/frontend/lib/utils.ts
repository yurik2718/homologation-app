import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cached once at module load — CSRF token doesn't change during a page session
export const csrfToken: string =
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? ""

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getOptionLabel(
  opt: { key: string; label?: string; label_es?: string; label_en?: string; label_ru?: string },
  locale: string
): string {
  const key = `label_${locale}` as keyof typeof opt
  return (opt[key] as string) || opt.label || opt.key
}
