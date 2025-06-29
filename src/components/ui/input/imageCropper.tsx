'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview' // Assuming this helper is in the same directory

import 'react-image-crop/dist/ReactCrop.css'

// --- Helper Function ---
// It's good practice to keep utility functions separate or at the top.
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

// --- Component Props Interface ---
interface ImageCropperProps {
  label?: string
  aspect?: number
  onChange?: (blobUrl: string | null) => void
  className?: string
  initialPreview?: string | null
}

// --- The Component ---
export function ImageCropper({
  label = 'Select Image',
  aspect = 1,
  onChange,
  className,
  initialPreview = null,
}: ImageCropperProps) {
  // State
  const [imgSrc, setImgSrc] = useState('')
  const [preview, setPreview] = useState<string | null>(initialPreview)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isModalOpen, setModalOpen] = useState(false)
  const [isApplyingCrop, setIsApplyingCrop] = useState(false)

  // Refs
  const imgRef = useRef<HTMLImageElement>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null)
  const inputFileRef = useRef<HTMLInputElement>(null)

  // --- State Reset Logic ---
  const resetState = useCallback(() => {
    setImgSrc('')
    setCrop(undefined)
    setCompletedCrop(undefined)
    setModalOpen(false)
    setIsApplyingCrop(false)

    // Reset the file input so the same file can be selected again
    if (inputFileRef.current) {
      inputFileRef.current.value = ''
    }
  }, [])

  // --- Handlers ---
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
        setModalOpen(true)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initialCrop = centerAspectCrop(width, height, aspect)
    setCrop(initialCrop)
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height))
  }

  const handleApplyCrop = useCallback(async () => {
    const image = imgRef.current
    const canvas = hiddenCanvasRef.current
    if (!image || !canvas || !completedCrop) {
      return
    }

    setIsApplyingCrop(true)
    try {
      // The canvasPreview function can be intensive, so we await it
      await canvasPreview(image, canvas, completedCrop, 1, 0)

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty')
          return
        }
        // Create a new URL and update the state
        const previewUrl = URL.createObjectURL(blob)
        setPreview(previewUrl)
        onChange?.(previewUrl)
        resetState()
      }, 'image/png')
    } catch (error) {
      console.error('Error applying crop:', error)
      // Ensure state is reset even on error
      resetState()
    }
  }, [completedCrop, onChange, resetState])

  const handleCancelCrop = useCallback(() => {
    resetState()
  }, [resetState])

  const handleRemoveImage = useCallback(() => {
    if (preview) {
      // Revoke the old URL before setting the new one
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    onChange?.(null)
    resetState()
  }, [preview, onChange, resetState])

  // --- Effects ---
  // [CRITICAL] Memory Leak Prevention: Revoke the object URL when the component unmounts or the preview changes.
  useEffect(() => {
    // This function will be called when the component unmounts
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <div className={className}>
      <label
        htmlFor="file-input"
        className="inline-flex items-center justify-center w-40 h-40 border-2 border-dashed border-muted rounded-md cursor-pointer overflow-hidden bg-muted/30 hover:border-primary transition-colors"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Image preview"
            className="w-full h-full object-cover"
            width={160}
            height={160}
            unoptimized // Necessary for blob URLs
          />
        ) : (
          <span className="text-muted-foreground text-center px-2">{label}</span>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          ref={inputFileRef}
          className="hidden"
        />
      </label>

      {preview && (
        <Button
          variant="destructive"
          onClick={handleRemoveImage}
          className="mt-2"
          size="sm"
        >
          Remove Image
        </Button>
      )}

      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minHeight={100}
            >
              <Image
                ref={imgRef}
                alt="Image to crop"
                src={imgSrc}
                onLoad={onImageLoad}
                width={800} // Use a larger base width for better quality in the modal
                height={600}
                style={{ maxHeight: '70vh', width: 'auto' }} // Constrain display size
                unoptimized
              />
            </ReactCrop>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelCrop}>
              Cancel
            </Button>
            <Button onClick={handleApplyCrop} disabled={isApplyingCrop}>
              {isApplyingCrop ? 'Applying...' : 'Apply Crop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* This canvas is used for generating the cropped image and is not displayed */}
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}