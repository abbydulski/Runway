import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Default avatar image path - upload your logo to public/default-avatar.png
export const DEFAULT_AVATAR = '/default-avatar.png'

// Get avatar URL - returns user's avatar if set, otherwise returns default
export function getAvatarUrl(avatarUrl?: string | null): string {
  return avatarUrl || DEFAULT_AVATAR
}
