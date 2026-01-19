'use client';

import type React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import { canvasPreview } from './canvasPreview';

import 'react-image-crop/dist/ReactCrop.css';

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
  );
}

interface ImageCropperProps {
  label?: string;
  aspect?: number;
  onChange?: (file: File | null) => void;
  className?: string;
  initialPreview?: string | null;
}

export function ImageCropper({
  label = 'Select Image',
  aspect = 1,
  onChange,
  className,
  initialPreview = null,
}: ImageCropperProps) {
  // State
  const [imgSrc, setImgSrc] = useState('');
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);

  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  // --- State Reset Logic ---
  const resetState = useCallback(() => {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setModalOpen(false);
    setIsApplyingCrop(false);

    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  }, []);

  // --- Handlers ---
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, aspect);
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
  };

  const handleApplyCrop = useCallback(async () => {
    const image = imgRef.current;
    const canvas = hiddenCanvasRef.current;
    if (!image || !canvas || !completedCrop) {
      return;
    }

    setIsApplyingCrop(true);
    try {
      await canvasPreview(image, canvas, completedCrop, 1, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas vazio');
          return;
        }

        // Tenta criar File a partir do blob (se suportado)
        let file: File | null = null;
        try {
          if (typeof File !== 'undefined') {
            file = new File([blob], 'cropped-image.png', {
              type: blob.type,
              lastModified: Date.now(),
            });
          } else {
            console.error('File API não suportada neste navegador móvel. Atualize o navegador.');
            return;
          }
        } catch (e) {
          console.error('Erro ao criar File a partir de blob:', e);
          return;
        }

        onChange?.(file);
        setPreview(URL.createObjectURL(blob));
        resetState();
      }, 'image/png');
    } catch (error) {
      console.error('Erro ao aplicar crop:', error);
      resetState();
    } finally {
      setIsApplyingCrop(false);
    }
  }, [completedCrop, onChange, resetState]);

  const handleCancelCrop = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleRemoveImage = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange?.(null);
    resetState();
  }, [preview, onChange, resetState]);

  // --- Effects ---
  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
            unoptimized
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
                width={800}
                height={600}
                style={{ maxHeight: '70vh', width: 'auto' }}
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

      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}
