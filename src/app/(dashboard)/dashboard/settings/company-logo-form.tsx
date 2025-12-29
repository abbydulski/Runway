'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Upload, Building2, Check, X } from 'lucide-react'
import { getAvatarUrl } from '@/lib/utils'

interface CompanyLogoFormProps {
  organizationId: string
  currentLogoUrl: string | null
}

export function CompanyLogoForm({ organizationId, currentLogoUrl }: CompanyLogoFormProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${organizationId}-logo.${fileExt}`
      const filePath = `logos/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrl)
      
      // Auto-save after upload
      await saveLogo(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload image. Make sure storage is configured.')
    } finally {
      setIsUploading(false)
    }
  }

  const saveLogo = async (url: string) => {
    setIsSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('organizations')
      .update({ logo_url: url })
      .eq('id', organizationId)

    setIsSaving(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }
  }

  const handleUrlSave = async () => {
    await saveLogo(logoUrl)
  }

  const handleRemoveLogo = async () => {
    setLogoUrl('')
    await saveLogo('')
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <Label className="text-base font-medium">Company Logo</Label>
      <p className="text-sm text-muted-foreground">
        This logo will be used across the platform as your company avatar
      </p>
      
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={getAvatarUrl(logoUrl)} alt="Company logo" />
          <AvatarFallback>
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Image
            </Button>
            {logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-destructive hover:text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="text-xs text-muted-foreground">
            Or enter a URL directly:
          </div>
          
          <div className="flex gap-2">
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleUrlSave}
              disabled={isSaving || logoUrl === currentLogoUrl}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSaved ? (
                <Check className="h-4 w-4" />
              ) : (
                'Save'
              )}
            </Button>
          </div>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

