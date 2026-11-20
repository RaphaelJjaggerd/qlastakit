import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the custom token utilities from theme.css, or it
 * cannot resolve conflicts such as `shadow-card` vs `shadow-none`.
 * When you add a shadow, font, duration or easing token, add its name here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: [
        "raised",
        "recessed",
        "card",
        "popover",
        "subtle",
        "switch-track",
        "switch-thumb",
        "switch-thumb-checked",
        "etched-h",
        "etched-v",
        "sidebar-ring",
        "sidebar-ring-hover",
      ],
      font: ["heading"],
      ease: ["sidebar"],
      text: ["overline"],
    },
    classGroups: {
      duration: [{ duration: ["fast", "slow"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
