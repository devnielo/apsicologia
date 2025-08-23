'use client'

import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  profileImage?: string
  phone?: string
  preferences?: any
}

export function useProfile() {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateProfileImage = useCallback(async (base64Image: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsUpdating(true)
      
      const response = await api.auth.updateProfile({ 
        profileImage: base64Image 
      })
      
      if (response.data.success) {
        // Reload the page to refresh user data
        window.location.reload()
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error: any) {
      console.error('Error updating profile image:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar la imagen de perfil' 
      }
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsUpdating(true)
      
      const response = await api.auth.updateProfile(data)
      
      if (response.data.success) {
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar el perfil' 
      }
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return {
    updateProfileImage,
    updateProfile,
    isUpdating
  }
}
