import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Default avatar/logo image path
export const DEFAULT_AVATAR = '/RunwayPlaceholderLogo.png'

// Get avatar URL - returns user's avatar if set, otherwise returns default
export function getAvatarUrl(avatarUrl?: string | null): string {
  return avatarUrl || DEFAULT_AVATAR
}
