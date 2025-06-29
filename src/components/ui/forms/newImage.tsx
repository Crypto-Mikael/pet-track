'use client'

import React, { useRef, useState } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useDebounceEffect } from './useDebounceEffect'
import { canvasPreview, imgPreview } from './canvasUtils'
import Image from 'next/image'

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCrop({
  imageSrc,
  onCompleteCrop,
}: {
  imageSrc: string
  onCompleteCrop: (blobUrl: string) => void
}) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect] = useState(1) // Square crop

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspect))
  }

  useDebounceEffect(
    () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop
        )
      }
    },
    100,
    [completedCrop]
  )

  async function handleExport() {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current
    ) {
      const url = await imgPreview(imgRef.current, completedCrop)
      if (url) {
        onCompleteCrop(url)
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!!imageSrc && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          minHeight={100}
        >
          <Image
            width={600}
            height={400}
            ref={imgRef}
            alt="Crop me"
            src={imageSrc}
            onLoad={onImageLoad}
            className="object-contain"
          />
        </ReactCrop>
      )}

      <div className="flex gap-4">
        <canvas
          ref={previewCanvasRef}
          className="border rounded"
          style={{
            width: completedCrop?.width ?? 0,
            height: completedCrop?.height ?? 0,
          }}
        />
      </div>

      <button
        className="bg-primary text-white rounded px-4 py-2"
        onClick={handleExport}
      >
        Apply Crop
      </button>
    </div>
  )
}
