'use client'

import { useState } from 'react'
import { Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// Simple toast replacement - can be enhanced later
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === 'destructive') {
      alert(`Error: ${description}`)
    } else {
      alert(`${title}: ${description}`)
    }
  }
})
import { 
  fileToBase64, 
  validateImageFile, 
  selectImageFile,
  generateInitials,
  base64ToImageUrl 
} from '@/lib/utils'
import { useProfile } from '@/hooks/use-profile'

interface ProfileImageUploadProps {
  currentImage?: string
  userName: string
  onImageUpdate: (base64Image: string) => void
  className?: string
}

export function ProfileImageUpload({
  currentImage,
  userName,
  onImageUpdate,
  className = ""
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { updateProfileImage } = useProfile()

  const handleImageSelect = async () => {
    try {
      setIsUploading(true)
      const files = await selectImageFile()
      
      if (files.length === 0) return

      const file = files[0]
      const validation = validateImageFile(file, { maxSizeKB: 1024 })
      
      if (!validation.valid) {
        toast({
          title: "Error",
          description: validation.error || "Error de validación",
          variant: "destructive"
        })
        return
      }

      const base64 = await fileToBase64(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8,
        format: 'jpeg'
      })

      // Update both locally and on server
      const result = await updateProfileImage(base64)
      
      if (result.success) {
        onImageUpdate(base64)
        toast({
          title: "Éxito",
          description: "Imagen de perfil actualizada"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar imagen",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const imageUrl = currentImage ? base64ToImageUrl(currentImage) : undefined

  return (
    <div className={`relative ${className}`}>
      <Avatar className="h-9 w-9 ring-2 ring-slate-200">
        <AvatarImage src={imageUrl} alt={userName} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
          {generateInitials(userName)}
        </AvatarFallback>
      </Avatar>
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white border border-slate-200 p-0 hover:bg-slate-50"
        onClick={handleImageSelect}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <Camera className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}
