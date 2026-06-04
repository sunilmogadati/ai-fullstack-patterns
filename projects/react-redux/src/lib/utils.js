// cn() — the shadcn convention for composing Tailwind classes.
//
// clsx flattens an array of conditional class arguments into a string.
// tailwind-merge resolves conflicts in that string by Tailwind's specificity
// rules (e.g. "px-4 px-6" becomes "px-6", not both).
//
// This is the helper that lets shadcn components accept a `className` prop
// and have the consumer override individual utilities safely.

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
