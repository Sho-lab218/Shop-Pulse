'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getPlaceholderImage } from '@/lib/image-utils'

interface ProductImageProps {
  imageUrl: string | null | undefined
  category: string
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
}

export default function ProductImage({
  imageUrl,
  category,
  alt,
  fill = false,
  className = '',
  width,
  height,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // Start with the imageUrl if it exists, otherwise use placeholder
    return imageUrl || getPlaceholderImage(category)
  })
  const [hasError, setHasError] = useState(false)

  // Update image source when imageUrl or category changes
  useEffect(() => {
    if (imageUrl && !hasError) {
      setImgSrc(imageUrl)
    } else {
      setImgSrc(getPlaceholderImage(category))
    }
  }, [imageUrl, category, hasError])

  const handleError = () => {
    // If image fails to load, use placeholder
    if (!hasError) {
      setHasError(true)
      setImgSrc(getPlaceholderImage(category))
    }
  }

  // Reset error state when imageUrl changes
  useEffect(() => {
    setHasError(false)
  }, [imageUrl])

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        unoptimized
        onError={handleError}
        priority={false}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      unoptimized
      onError={handleError}
      priority={false}
    />
  )
}

