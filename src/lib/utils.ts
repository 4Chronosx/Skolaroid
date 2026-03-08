import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Derives the era decade (e.g. 2020) from a `batch-XXXX` tag on a memory.
 * Falls back to the decade of `fallbackDate` if no matching tag is found.
 */
export function getEraFromBatchTag(
  tags: { name: string }[],
  fallbackDate?: string | null
): number {
  for (const tag of tags) {
    const match = tag.name.match(/^batch-(\d{4})$/i);
    if (match) {
      return Math.floor(parseInt(match[1], 10) / 10) * 10;
    }
  }
  if (fallbackDate) {
    return Math.floor(new Date(fallbackDate).getFullYear() / 10) * 10;
  }
  return 2020;
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
