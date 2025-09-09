'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api'

interface ImageUploadProps {
  serviceId: string
  currentImageUrl?: string
  onImageUpdate?: (imageUrl: string | null) => void
  className?: string
  isEditing?: boolean
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function ImageUpload({ 
  serviceId, 
  currentImageUrl, 
  onImageUpdate,
  className = '',
  isEditing = false
}: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const queryClient = useQueryClient()

  // Don't render if no serviceId
  if (!serviceId) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-sm text-gray-500 py-4">
          Service ID required for image upload
        </div>
      </div>
    )
  }

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('image', file)

      const response = await apiClient.post(`/services/${serviceId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    },
    onSuccess: (data) => {
      toast.success('Image uploaded successfully')
      onImageUpdate?.(data.data.imageUrl)
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setUploadProgress(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Error uploading image')
      setUploadProgress(null)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/services/${serviceId}/image`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Image deleted successfully')
      onImageUpdate?.(null)
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Error deleting image')
    }
  })

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG and WebP images are allowed'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB'
    }
    return null
  }

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (!prev) return null
        const newPercentage = Math.min(prev.percentage + Math.random() * 30, 90)
        return {
          ...prev,
          percentage: newPercentage
        }
      })
    }, 200)

    try {
      await uploadMutation.mutateAsync(file)
    } finally {
      clearInterval(progressInterval)
    }
  }, [uploadMutation])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragActive(false)
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0])
    }
  }, [handleFileUpload])

  const onDragEnter = useCallback(() => {
    setIsDragActive(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragActive(false)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending || deleteMutation.isPending
  })

  const isLoading = uploadMutation.isPending || deleteMutation.isPending

  // If not editing, just show the image or placeholder
  if (!isEditing) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Service Image</h3>
        </div>
        {currentImageUrl ? (
          <div className="relative w-full max-w-sm">
            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={currentImageUrl}
                alt="Service image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4">
            No image uploaded
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Service Image</h3>
        {currentImageUrl && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove service image</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this image? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Current Image Display */}
      {currentImageUrl && !uploadProgress && (
        <div className="relative w-full max-w-sm">
          <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={currentImageUrl}
              alt="Service image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading image...
          </div>
          <Progress value={uploadProgress.percentage} className="h-2" />
        </div>
      )}

      {/* Upload Dropzone */}
      {!currentImageUrl && !uploadProgress && (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="flex justify-center">
              {isDragActive ? (
                <Upload className="h-8 w-8 text-blue-500" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop image here' : 'Upload service image'}
              </p>
              <p className="text-xs text-gray-500">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </div>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          )}
        </div>
      )}

      {/* Replace Image Button */}
      {currentImageUrl && !uploadProgress && !isLoading && (
        <div
          {...getRootProps()}
          className="border border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Upload className="h-4 w-4" />
            Replace image
          </div>
        </div>
      )}

      {/* File Requirements */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div>
          <div>Recommended: 16:9 aspect ratio for best display</div>
          <div>Formats: JPEG, PNG, WebP • Max size: 5MB</div>
        </div>
      </div>
    </div>
  )
}
