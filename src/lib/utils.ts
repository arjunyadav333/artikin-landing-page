import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format text with hashtags and links
export function formatText(text: string): string {
  return text
    .replace(
      /#(\w+)/g,
      '<span class="text-primary hover:underline cursor-pointer">#$1</span>'
    )
    .replace(
      /@(\w+)/g,
      '<span class="text-primary hover:underline cursor-pointer">@$1</span>'
    )
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    )
    .replace(/\n/g, '<br>')
}
