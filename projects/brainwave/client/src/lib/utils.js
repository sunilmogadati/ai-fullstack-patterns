// cn() — same helper as the react-redux project; lets shadcn components
// accept a className prop and have the consumer override individual
// utilities safely.

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
