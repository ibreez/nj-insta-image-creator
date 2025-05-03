"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Spinner } from "./spinner"
import type { TextElement } from "@/types/text-element"
import type { OverlayImage } from "@/types/overlay-image"

interface ImageEditorProps {
  productImage: File
  brandingFrame: File | null
  overlayImages: OverlayImage[]
  selectedOverlayId: string | null
  setSelectedOverlayId: (id: string | null) => void
  updateOverlayPosition: (id: string, position: { x: number; y: number }) => void
  updateOverlayScale: (id: string, scale: number) => void
  textElements: TextElement[]
  selectedTextId: string | null
  setSelectedTextId: (id: string | null) => void
  updateTextPosition: (position: { x: number; y: number }) => void
  previewMode: "square" | "story"
  removeBackground: boolean
  apiKey: string
  imagePosition: { x: number; y: number }
  setImagePosition: (position: { x: number; y: number }) => void
  imageScale: number
  setImageScale: (scale: number) => void
  isEditingImage: boolean
  setIsEditingImage: (isEditing: boolean) => void
  isPrinting: boolean
}

export default function ImageEditor({
  productImage,
  brandingFrame,
  overlayImages,
  selectedOverlayId,
  setSelectedOverlayId,
  updateOverlayPosition,
  updateOverlayScale,
  textElements,
  selectedTextId,
  setSelectedTextId,
  updateTextPosition,
  previewMode,
  removeBackground,
  apiKey,
  imagePosition,
  setImagePosition,
  imageScale,
  setImageScale,
  isEditingImage,
  setIsEditingImage,
  isPrinting,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [productImageObj, setProductImageObj] = useState<HTMLImageElement | null>(null)
  const [frameImageObj, setFrameImageObj] = useState<HTMLImageElement | null>(null)
  const [overlayImageObjs, setOverlayImageObjs] = useState<Record<string, HTMLImageElement>>({})
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isImageDragging, setIsImageDragging] = useState(false)
  const [isOverlayDragging, setIsOverlayDragging] = useState(false)
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null)
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(null)

  // Load product image
  useEffect(() => {
    if (productImage) {
      const img = new Image()
      img.src = URL.createObjectURL(productImage)
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setProductImageObj(img)
      }
    }
  }, [productImage])

  // Load branding frame
  useEffect(() => {
    if (brandingFrame) {
      const img = new Image()
      img.src = URL.createObjectURL(brandingFrame)
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setFrameImageObj(img)
      }
    } else {
      setFrameImageObj(null)
    }
  }, [brandingFrame])

  // Load overlay images
  useEffect(() => {
    const newOverlayObjs: Record<string, HTMLImageElement> = {}

    // Load each overlay image
    overlayImages.forEach((overlay) => {
      const img = new Image()
      img.src = URL.createObjectURL(overlay.file)
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setOverlayImageObjs((prev) => ({
          ...prev,
          [overlay.id]: img,
        }))
      }
    })

    // Clean up any overlay images that are no longer in the list
    setOverlayImageObjs((prev) => {
      const newObjs = { ...prev }
      Object.keys(newObjs).forEach((id) => {
        if (!overlayImages.some((overlay) => overlay.id === id)) {
          delete newObjs[id]
        }
      })
      return newObjs
    })
  }, [overlayImages])

  // Remove background if enabled
  useEffect(() => {
    if (removeBackground && productImage && apiKey) {
      removeProductBackground()
    } else {
      setProcessedImage(null)
    }
  }, [removeBackground, productImage, apiKey])

  const removeProductBackground = async () => {
    setIsLoading(true)

    try {
      // This is a mock implementation - in a real app, you would call the remove.bg API
      // For demo purposes, we'll just add a delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, you would:
      // 1. Create a FormData object with the image
      // 2. Send it to the remove.bg API with your API key
      // 3. Get back the processed image and set it

      // For now, we'll just use the original image
      setProcessedImage(URL.createObjectURL(productImage))
    } catch (error) {
      console.error("Error removing background:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions based on preview mode
    if (previewMode === "square") {
      canvas.width = 1080
      canvas.height = 1080
    } else {
      canvas.width = 1080
      canvas.height = 1920
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fill background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw branding frame (bottom layer)
    if (frameImageObj) {
      ctx.drawImage(frameImageObj, 0, 0, canvas.width, canvas.height)
    }

    // Draw product image (middle layer)
    if (productImageObj || processedImage) {
      const img = processedImage ? new Image() : productImageObj

      if (processedImage) {
        img.src = processedImage
        img.crossOrigin = "anonymous"
      }

      if (img) {
        // Calculate base dimensions to fit the image
        const imgRatio = img.width / img.height
        const canvasRatio = canvas.width / canvas.height

        let baseWidth, baseHeight

        if (imgRatio > canvasRatio) {
          // Image is wider than canvas
          baseWidth = canvas.width
          baseHeight = canvas.width / imgRatio
        } else {
          // Image is taller than canvas
          baseHeight = canvas.height
          baseWidth = canvas.height * imgRatio
        }

        // Apply scaling
        const scaledWidth = baseWidth * imageScale
        const scaledHeight = baseHeight * imageScale

        // Calculate position with offset
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        // Apply user-defined position offset
        const drawX = centerX - scaledWidth / 2 + imagePosition.x
        const drawY = centerY - scaledHeight / 2 + imagePosition.y

        ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight)

        // Draw a border around the image when in editing mode
        if (isEditingImage && !isPrinting) {
          ctx.strokeStyle = "#ff4081"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(drawX, drawY, scaledWidth, scaledHeight)
          ctx.setLineDash([])
        }
      }
    }

    // Create a combined array of all elements (text and overlays) to sort by zIndex
    const allElements: Array<{
      type: "text" | "overlay"
      element: TextElement | OverlayImage
    }> = [
      ...textElements.map((el) => ({ type: "text" as const, element: el })),
      ...overlayImages.map((el) => ({ type: "overlay" as const, element: el })),
    ]

    // Sort all elements by zIndex
    allElements.sort((a, b) => a.element.zIndex - b.element.zIndex)

    // Draw all elements in order of zIndex
    allElements.forEach((item) => {
      if (item.type === "text") {
        // Draw text element
        const element = item.element as TextElement
        const { text, position, style } = element

        if (!text) return

        // Apply text styling
        const fontStyle = []
        if (style.isItalic) fontStyle.push("italic")
        if (style.isBold) fontStyle.push("bold")

        const fontString = `${fontStyle.join(" ")} ${style.fontSize}px ${style.fontFamily}`
        ctx.font = fontString
        ctx.fillStyle = style.color
        ctx.textAlign = style.alignment as CanvasTextAlign

        // Calculate x position based on alignment
        let x = (canvas.width * position.x) / 100
        if (style.alignment === "left") {
          x = Math.max(20, (canvas.width * position.x) / 100 - canvas.width / 2 + 100)
        } else if (style.alignment === "right") {
          x = Math.min(canvas.width - 20, (canvas.width * position.x) / 100 + canvas.width / 2 - 100)
        }

        const y = (canvas.height * position.y) / 100

        // Add text shadow for better visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2

        // Handle multiline text
        const lines = text.split("\n")
        const lineHeight = style.fontSize * 1.2

        lines.forEach((line, index) => {
          ctx.fillText(line, x, y + index * lineHeight - ((lines.length - 1) * lineHeight) / 2)
        })

        // Draw selection indicator for the selected text
        if (element.id === selectedTextId && !isPrinting) {
          // Calculate text dimensions
          const maxLineWidth = Math.max(...lines.map((line) => ctx.measureText(line).width))
          const textHeight = lines.length * lineHeight

          // Draw selection box
          ctx.strokeStyle = "#2196f3"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])

          let boxX = x
          const boxWidth = maxLineWidth

          if (style.alignment === "center") {
            boxX = x - maxLineWidth / 2
          } else if (style.alignment === "right") {
            boxX = x - maxLineWidth
          }

          const boxY = y - textHeight / 2 - style.fontSize / 2

          ctx.strokeRect(boxX - 10, boxY - 10, boxWidth + 20, textHeight + 20)
          ctx.setLineDash([])
        }

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      } else {
        // Draw overlay image
        const overlay = item.element as OverlayImage
        const overlayImg = overlayImageObjs[overlay.id]
        if (!overlayImg) return

        // Calculate dimensions
        const imgRatio = overlayImg.width / overlayImg.height
        const canvasRatio = canvas.width / canvas.height

        let baseWidth, baseHeight

        if (imgRatio > canvasRatio) {
          // Image is wider than canvas
          baseWidth = canvas.width * 0.5 // Default to 50% of canvas width
          baseHeight = baseWidth / imgRatio
        } else {
          // Image is taller than canvas
          baseHeight = canvas.height * 0.5 // Default to 50% of canvas height
          baseWidth = baseHeight * imgRatio
        }

        // Apply scaling
        const scaledWidth = baseWidth * overlay.scale
        const scaledHeight = baseHeight * overlay.scale

        // Calculate position
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        // Apply user-defined position offset
        const drawX = centerX - scaledWidth / 2 + (overlay.position.x * canvas.width) / 100
        const drawY = centerY - scaledHeight / 2 + (overlay.position.y * canvas.height) / 100

        ctx.drawImage(overlayImg, drawX, drawY, scaledWidth, scaledHeight)

        // Draw selection border if this overlay is selected
        if (overlay.id === selectedOverlayId && !isPrinting) {
          ctx.strokeStyle = "#4caf50"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(drawX, drawY, scaledWidth, scaledHeight)
          ctx.setLineDash([])
        }
      }
    })
  }, [
    productImageObj,
    frameImageObj,
    overlayImageObjs,
    overlayImages,
    textElements,
    selectedTextId,
    selectedOverlayId,
    previewMode,
    processedImage,
    imagePosition,
    imageScale,
    isEditingImage,
    isPrinting,
  ])

  // Find which text element was clicked
  const findClickedTextElement = (x: number, y: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Sort text elements by zIndex in descending order to select the top-most element first
    const sortedElements = [...textElements].sort((a, b) => b.zIndex - a.zIndex)

    for (const element of sortedElements) {
      const { text, position, style } = element

      if (!text) continue

      // Calculate text dimensions
      const lines = text.split("\n")
      const lineHeight = style.fontSize * 1.2
      const textHeight = lines.length * lineHeight

      // Apply text styling to get accurate measurements
      const fontStyle = []
      if (style.isItalic) fontStyle.push("italic")
      if (style.isBold) fontStyle.push("bold")
      ctx.font = `${fontStyle.join(" ")} ${style.fontSize}px ${style.fontFamily}`

      const maxLineWidth = Math.max(...lines.map((line) => ctx.measureText(line).width))

      // Calculate position
      let textX = (canvas.width * position.x) / 100
      if (style.alignment === "left") {
        textX = Math.max(20, (canvas.width * position.x) / 100 - canvas.width / 2 + 100)
      } else if (style.alignment === "right") {
        textX = Math.min(canvas.width - 20, (canvas.width * position.x) / 100 + canvas.width / 2 - 100)
      }

      const textY = (canvas.height * position.y) / 100

      // Adjust hit box based on alignment
      let boxX = textX
      if (style.alignment === "center") {
        boxX = textX - maxLineWidth / 2
      } else if (style.alignment === "right") {
        boxX = textX - maxLineWidth
      }

      const boxY = textY - textHeight / 2

      // Check if click is within the text bounding box (with some padding)
      const padding = 20
      if (
        x >= boxX - padding &&
        x <= boxX + maxLineWidth + padding &&
        y >= boxY - padding &&
        y <= boxY + textHeight + padding
      ) {
        return element.id
      }
    }

    return null
  }

  // Find which overlay image was clicked
  const findClickedOverlay = (x: number, y: number, canvas: HTMLCanvasElement) => {
    // Sort overlay images by zIndex in descending order to select the top-most overlay first
    const sortedOverlays = [...overlayImages].sort((a, b) => b.zIndex - a.zIndex)

    for (const overlay of sortedOverlays) {
      const overlayImg = overlayImageObjs[overlay.id]

      if (!overlayImg) continue

      // Calculate dimensions
      const imgRatio = overlayImg.width / overlayImg.height
      const canvasRatio = canvas.width / canvas.height

      let baseWidth, baseHeight

      if (imgRatio > canvasRatio) {
        baseWidth = canvas.width * 0.5
        baseHeight = baseWidth / imgRatio
      } else {
        baseHeight = canvas.height * 0.5
        baseWidth = baseHeight * imgRatio
      }

      // Apply scaling
      const scaledWidth = baseWidth * overlay.scale
      const scaledHeight = baseHeight * overlay.scale

      // Calculate position
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Apply user-defined position offset
      const drawX = centerX - scaledWidth / 2 + (overlay.position.x * canvas.width) / 100
      const drawY = centerY - scaledHeight / 2 + (overlay.position.y * canvas.height) / 100

      // Check if click is within the overlay bounding box
      if (x >= drawX && x <= drawX + scaledWidth && y >= drawY && y <= drawY + scaledHeight) {
        return overlay.id
      }
    }

    return null
  }

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // First check if an overlay image was clicked
    const clickedOverlayId = findClickedOverlay(x, y, canvas)

    if (clickedOverlayId) {
      setSelectedOverlayId(clickedOverlayId)
      setDraggingOverlayId(clickedOverlayId)
      setIsOverlayDragging(true)
      setDragStart({ x, y })
      return
    }

    // Then check if a text element was clicked
    const clickedTextId = findClickedTextElement(x, y, ctx, canvas)

    if (clickedTextId) {
      setSelectedTextId(clickedTextId)
      setDraggingTextId(clickedTextId)
      setIsDragging(true)
      setDragStart({ x, y })
      return
    }

    // Finally, if in image editing mode, handle product image dragging
    if (isEditingImage && (productImageObj || processedImage)) {
      setIsImageDragging(true)
      setDragStart({ x, y })
      return
    }

    // If nothing was clicked, deselect everything
    setSelectedTextId(null)
    setSelectedOverlayId(null)
    setDraggingTextId(null)
    setDraggingOverlayId(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if ((!isDragging && !isImageDragging && !isOverlayDragging) || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const deltaX = x - dragStart.x
    const deltaY = y - dragStart.y

    if (isOverlayDragging && draggingOverlayId) {
      // Find the overlay being dragged
      const overlay = overlayImages.find((o) => o.id === draggingOverlayId)

      if (overlay) {
        // Calculate new position in percentage of canvas dimensions
        const newX = overlay.position.x + (deltaX / canvas.width) * 100
        const newY = overlay.position.y + (deltaY / canvas.height) * 100

        // Update overlay position
        updateOverlayPosition(draggingOverlayId, { x: newX, y: newY })
      }
    } else if (isImageDragging) {
      // Update image position
      setImagePosition({
        x: imagePosition.x + deltaX,
        y: imagePosition.y + deltaY,
      })
    } else if (isDragging && draggingTextId) {
      // Find the text element being dragged
      const textElement = textElements.find((el) => el.id === draggingTextId)

      if (textElement) {
        // Update text position
        const newX = Math.max(0, Math.min(100, textElement.position.x + (deltaX / canvas.width) * 100))
        const newY = Math.max(0, Math.min(100, textElement.position.y + (deltaY / canvas.height) * 100))
        updateTextPosition({ x: newX, y: newY })
      }
    }

    setDragStart({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsImageDragging(false)
    setIsOverlayDragging(false)
    setDraggingTextId(null)
    setDraggingOverlayId(null)
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
            <Spinner />
            <span>Removing background...</span>
          </div>
        </div>
      )}

      {isDragging && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm bg-black bg-opacity-50 text-white py-1">
          Drag to position text
        </div>
      )}

      {isImageDragging && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm bg-black bg-opacity-50 text-white py-1">
          Drag to position image
        </div>
      )}

      {isOverlayDragging && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm bg-black bg-opacity-50 text-white py-1">
          Drag to position overlay image
        </div>
      )}

      {isEditingImage && !isImageDragging && !isOverlayDragging && !isDragging && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm bg-black bg-opacity-50 text-white py-1">
          Click and drag to move elements
        </div>
      )}
    </div>
  )
}
