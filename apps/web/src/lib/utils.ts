import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Image utilities for profile management
export interface ImageResizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Convert a File to base64 string with optional resizing
 */
export function fileToBase64(file: File, options: ImageResizeOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 400,
      maxHeight = 400,
      quality = 0.8,
      format = 'jpeg'
    } = options

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        const mimeType = format === 'png' ? 'image/png' : `image/${format}`
        const base64 = canvas.toDataURL(mimeType, quality)
        
        // Remove data:image/...;base64, prefix for clean base64
        const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '')
        resolve(cleanBase64)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Convert base64 string to displayable image URL
 */
export const base64ToImageUrl = (base64String: string): string => {
  if (!base64String) return "";
  
  // Check if it already has data URL prefix
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  
  // Add data URL prefix for JPEG (most common)
  return `data:image/jpeg;base64,${base64String}`;
};  

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File, options: {
  maxSizeKB?: number
  allowedTypes?: string[]
} = {}): { valid: boolean; error?: string } {
  const {
    maxSizeKB = 2048, // 2MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  } = options

  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type not allowed. Supported formats: ${allowedTypes.join(', ')}` 
    }
  }

  if (file.size > maxSizeKB * 1024) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${maxSizeKB}KB` 
    }
  }

  return { valid: true }
}

/**
 * Generate user initials from name
 */
export function generateInitials(name: string): string {
  if (!name?.trim()) return 'U'
  
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || 'U'
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Create a file input element and trigger file selection
 */
export function selectImageFile(options: {
  accept?: string
  multiple?: boolean
} = {}): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = options.accept || 'image/jpeg,image/png,image/webp'
    input.multiple = options.multiple || false

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      resolve(files)
    }

    input.oncancel = () => resolve([])
    input.onerror = () => reject(new Error('File selection failed'))
    
    input.click()
  })
}