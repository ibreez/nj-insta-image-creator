"use client"

import type React from "react"

import { useState, useRef } from "react"
import { toPng } from "html-to-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, ImageIcon, ImagePlus, Layers, Trash2, Type } from "lucide-react"
import ImageEditor from "./image-editor"
import TextEditor from "./text-editor"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import type { TextElement } from "@/types/text-element"
import type { OverlayImage } from "@/types/overlay-image"
import { TextElementsList } from "./text-elements-list"
import { v4 as uuidv4 } from "uuid"
import { OverlayImageUploader } from "./overlay-image-uploader"

export default function ImageGenerator() {
  // File input refs
  const productImageInputRef = useRef<HTMLInputElement>(null)
  const brandingFrameInputRef = useRef<HTMLInputElement>(null)

  const [productImages, setProductImages] = useState<File[]>([])
  const [brandingFrame, setBrandingFrame] = useState<File | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Text elements state
  const [imageTextElements, setImageTextElements] = useState<Record<number, TextElement[]>>({
    0: [
      {
        id: uuidv4(),
        text: "Your promotional text here",
        position: { x: 50, y: 50 },
        style: {
          color: "#000000",
          fontSize: 32,
          fontFamily: "Arial",
          isBold: false,
          isItalic: false,
          alignment: "center",
        },
        zIndex: 10, // Default zIndex
      },
    ],
  })

  // Overlay images state
  const [imageOverlays, setImageOverlays] = useState<Record<number, OverlayImage[]>>({})
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)

  const [selectedTextId, setSelectedTextId] = useState<string | null>(imageTextElements[0]?.[0]?.id || null)

  const [previewMode, setPreviewMode] = useState<"square" | "story">("square")
  const [apiKey, setApiKey] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [showRemoveBackgroundDialog, setShowRemoveBackgroundDialog] = useState(false)
  const [imageSettings, setImageSettings] = useState<Array<{ position: { x: number; y: number }; scale: number }>>([])
  // Always enable image positioning
  const [isEditingImage, setIsEditingImage] = useState(true)
  const [enableImagePositioningInTextTab, setEnableImagePositioningInTextTab] = useState(false)
  const [isPrinting, setPrinting] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  const editorRef = useRef<HTMLDivElement>(null)

  // Get the currently selected text element
  const getCurrentTextElements = () => {
    return imageTextElements[currentImageIndex] || []
  }

  // Get the current overlay images
  const getCurrentOverlayImages = () => {
    return imageOverlays[currentImageIndex] || []
  }

  const selectedTextElement = getCurrentTextElements().find((el) => el.id === selectedTextId)
  const selectedOverlay = getCurrentOverlayImages().find((overlay) => overlay.id === selectedOverlayId)

  const updateCurrentImageSettings = (settings: { position?: { x: number; y: number }; scale?: number }) => {
    setImageSettings((prev) => {
      const newSettings = [...prev]
      if (!newSettings[currentImageIndex]) {
        newSettings[currentImageIndex] = { position: { x: 0, y: 0 }, scale: 1 }
      }

      if (settings.position) {
        newSettings[currentImageIndex].position = settings.position
      }

      if (settings.scale !== undefined) {
        newSettings[currentImageIndex].scale = settings.scale
      }

      return newSettings
    })
  }

  // Handle product image upload
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newImages = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"))

    if (newImages.length === 0) return

    // Add new images
    setProductImages((prev) => [...prev, ...newImages])

    // Initialize settings for new images
    setImageSettings((prev) => {
      const newSettings = [...prev]
      for (let i = 0; i < newImages.length; i++) {
        newSettings[prev.length + i] = { position: { x: 0, y: 0 }, scale: 1 }
      }
      return newSettings
    })

    // Initialize text elements for new images
    setImageTextElements((prev) => {
      const updated = { ...prev }
      for (let i = 0; i < newImages.length; i++) {
        const index = Object.keys(prev).length + i
        if (!updated[index]) {
          updated[index] = [
            {
              id: uuidv4(),
              text: "Your promotional text here",
              position: { x: 50, y: 50 },
              style: {
                color: "#000000",
                fontSize: 32,
                fontFamily: "Arial",
                isBold: false,
                isItalic: false,
                alignment: "center",
              },
              zIndex: 10, // Default zIndex
            },
          ]
        }
      }
      return updated
    })

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  // Handle branding frame upload
  const handleBrandingFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    if (file && file.type.startsWith("image/")) {
      setBrandingFrame(file)
    }

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...productImages]
    newImages.splice(index, 1)
    setProductImages(newImages)

    const newSettings = [...imageSettings]
    newSettings.splice(index, 1)
    setImageSettings(newSettings)

    // Remove text elements for this image
    setImageTextElements((prev) => {
      const updated = { ...prev }
      delete updated[index]

      // Reindex the remaining images
      const newElements: Record<number, TextElement[]> = {}
      let newIdx = 0

      Object.keys(updated).forEach((key) => {
        const numKey = Number.parseInt(key)
        if (numKey !== index) {
          const adjustedKey = numKey > index ? numKey - 1 : numKey
          newElements[newIdx] = updated[numKey]
          newIdx++
        }
      })

      return newElements
    })

    // Remove overlay images for this image
    setImageOverlays((prev) => {
      const updated = { ...prev }
      delete updated[index]

      // Reindex the remaining images
      const newOverlays: Record<number, OverlayImage[]> = {}
      let newIdx = 0

      Object.keys(updated).forEach((key) => {
        const numKey = Number.parseInt(key)
        if (numKey !== index) {
          const adjustedKey = numKey > index ? numKey - 1 : numKey
          newOverlays[newIdx] = updated[numKey]
          newIdx++
        }
      })

      return newOverlays
    })

    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1)
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0)
    }
  }

  const handleRemoveFrame = () => {
    setBrandingFrame(null)
  }

  const handleDownload = async () => {
    if (!editorRef.current) return

    try {
      // Set printing mode to hide selection borders
      setPrinting(true)

      // Small delay to ensure the component re-renders without borders
      await new Promise((resolve) => setTimeout(resolve, 100))

      const dataUrl = await toPng(editorRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      })

      // Reset printing mode
      setPrinting(false)

      const link = document.createElement("a")
      link.download = `instagram-${previewMode}-${currentImageIndex + 1}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error generating image:", error)
      setPrinting(false)
    }
  }

  const handleRemoveBackgroundToggle = () => {
    if (!removeBackground) {
      setShowRemoveBackgroundDialog(true)
    } else {
      setRemoveBackground(false)
    }
  }

  const confirmRemoveBackground = (key: string) => {
    setApiKey(key)
    setRemoveBackground(true)
    setShowRemoveBackgroundDialog(false)
  }

  // Text element management functions
  const addNewTextElement = () => {
    const currentElements = getCurrentTextElements()
    // Find the highest zIndex and add 10
    const highestZIndex = currentElements.length > 0 ? Math.max(...currentElements.map((el) => el.zIndex)) : 0

    const newElement: TextElement = {
      id: uuidv4(),
      text: "New text element",
      position: { x: 50, y: Math.min(80, 50 + getCurrentTextElements().length * 10) },
      style: {
        color: "#000000",
        fontSize: 32,
        fontFamily: "Arial",
        isBold: false,
        isItalic: false,
        alignment: "center",
      },
      zIndex: highestZIndex + 10, // Place on top
    }

    setImageTextElements((prev) => {
      const currentElements = prev[currentImageIndex] || []
      return {
        ...prev,
        [currentImageIndex]: [...currentElements, newElement],
      }
    })
    setSelectedTextId(newElement.id)
  }

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setImageTextElements((prev) => {
      const currentElements = prev[currentImageIndex] || []
      const updatedElements = currentElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
      return {
        ...prev,
        [currentImageIndex]: updatedElements,
      }
    })
  }

  const removeTextElement = (id: string) => {
    setImageTextElements((prev) => {
      const currentElements = prev[currentImageIndex] || []
      const filteredElements = currentElements.filter((el) => el.id !== id)

      // Update selected text ID if needed
      if (selectedTextId === id) {
        setSelectedTextId(filteredElements[0]?.id || null)
      }

      return {
        ...prev,
        [currentImageIndex]: filteredElements,
      }
    })
  }

  const updateSelectedTextPosition = (position: { x: number; y: number }) => {
    if (selectedTextId) {
      updateTextElement(selectedTextId, { position })
    }
  }

  // Layer management functions for text elements
  const moveTextElementUp = (id: string) => {
    setImageTextElements((prev) => {
      const currentElements = prev[currentImageIndex] || []
      const sortedElements = [...currentElements].sort((a, b) => a.zIndex - b.zIndex)

      // Find the element to move and the one above it
      const elementIndex = sortedElements.findIndex((el) => el.id === id)
      if (elementIndex === sortedElements.length - 1) {
        // Already at the top
        return prev
      }

      const currentElement = sortedElements[elementIndex]
      const aboveElement = sortedElements[elementIndex + 1]

      // Swap zIndex values
      const updatedElements = currentElements.map((el) => {
        if (el.id === id) {
          return { ...el, zIndex: aboveElement.zIndex + 1 }
        }
        return el
      })

      return {
        ...prev,
        [currentImageIndex]: updatedElements,
      }
    })
  }

  const moveTextElementDown = (id: string) => {
    setImageTextElements((prev) => {
      const currentElements = prev[currentImageIndex] || []
      const sortedElements = [...currentElements].sort((a, b) => a.zIndex - b.zIndex)

      // Find the element to move and the one below it
      const elementIndex = sortedElements.findIndex((el) => el.id === id)
      if (elementIndex === 0) {
        // Already at the bottom
        return prev
      }

      const currentElement = sortedElements[elementIndex]
      const belowElement = sortedElements[elementIndex - 1]

      // Swap zIndex values
      const updatedElements = currentElements.map((el) => {
        if (el.id === id) {
          return { ...el, zIndex: belowElement.zIndex - 1 }
        }
        return el
      })

      return {
        ...prev,
        [currentImageIndex]: updatedElements,
      }
    })
  }

  // Overlay image management functions
  const addOverlayImage = (file: File) => {
    const currentOverlays = getCurrentOverlayImages()
    // Find the highest zIndex and add 10
    const highestZIndex = currentOverlays.length > 0 ? Math.max(...currentOverlays.map((overlay) => overlay.zIndex)) : 0

    const newOverlay: OverlayImage = {
      id: uuidv4(),
      file,
      position: { x: 0, y: 0 },
      scale: 1,
      zIndex: highestZIndex + 10, // Place on top
    }

    setImageOverlays((prev) => {
      const currentOverlays = prev[currentImageIndex] || []
      return {
        ...prev,
        [currentImageIndex]: [...currentOverlays, newOverlay],
      }
    })

    setSelectedOverlayId(newOverlay.id)
  }

  const updateOverlayImage = (id: string, updates: Partial<Omit<OverlayImage, "id" | "file">>) => {
    setImageOverlays((prev) => {
      const currentOverlays = prev[currentImageIndex] || []
      const updatedOverlays = currentOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay,
      )

      return {
        ...prev,
        [currentImageIndex]: updatedOverlays,
      }
    })
  }

  const removeOverlayImage = (id: string) => {
    setImageOverlays((prev) => {
      const currentOverlays = prev[currentImageIndex] || []
      const filteredOverlays = currentOverlays.filter((overlay) => overlay.id !== id)

      // Update selected overlay ID if needed
      if (selectedOverlayId === id) {
        setSelectedOverlayId(filteredOverlays[0]?.id || null)
      }

      return {
        ...prev,
        [currentImageIndex]: filteredOverlays,
      }
    })
  }

  // Layer management functions for overlay images
  const moveOverlayImageUp = (id: string) => {
    setImageOverlays((prev) => {
      const currentOverlays = prev[currentImageIndex] || []
      const sortedOverlays = [...currentOverlays].sort((a, b) => a.zIndex - b.zIndex)

      // Find the overlay to move and the one above it
      const overlayIndex = sortedOverlays.findIndex((overlay) => overlay.id === id)
      if (overlayIndex === sortedOverlays.length - 1) {
        // Already at the top
        return prev
      }

      const currentOverlay = sortedOverlays[overlayIndex]
      const aboveOverlay = sortedOverlays[overlayIndex + 1]

      // Swap zIndex values
      const updatedOverlays = currentOverlays.map((overlay) => {
        if (overlay.id === id) {
          return { ...overlay, zIndex: aboveOverlay.zIndex + 1 }
        }
        return overlay
      })

      return {
        ...prev,
        [currentImageIndex]: updatedOverlays,
      }
    })
  }

  const moveOverlayImageDown = (id: string) => {
    setImageOverlays((prev) => {
      const currentOverlays = prev[currentImageIndex] || []
      const sortedOverlays = [...currentOverlays].sort((a, b) => a.zIndex - b.zIndex)

      // Find the overlay to move and the one below it
      const overlayIndex = sortedOverlays.findIndex((overlay) => overlay.id === id)
      if (overlayIndex === 0) {
        // Already at the bottom
        return prev
      }

      const currentOverlay = sortedOverlays[overlayIndex]
      const belowOverlay = sortedOverlays[overlayIndex - 1]

      // Swap zIndex values
      const updatedOverlays = currentOverlays.map((overlay) => {
        if (overlay.id === id) {
          return { ...overlay, zIndex: belowOverlay.zIndex - 1 }
        }
        return overlay
      })

      return {
        ...prev,
        [currentImageIndex]: updatedOverlays,
      }
    })
  }

  const handleScaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value >= 50 && value <= 200) {
      updateCurrentImageSettings({ scale: value / 100 })
    }
  }

  const handleFontSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTextElement) return

    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 12 && value <= 120) {
      updateTextElement(selectedTextElement.id, {
        style: { ...selectedTextElement.style, fontSize: value },
      })
    }
  }

  const handleBatchDownload = async () => {
    if (!editorRef.current || productImages.length <= 1) return

    // Save current image index
    const originalIndex = currentImageIndex

    try {
      // Set printing mode to hide selection borders
      setPrinting(true)

      // Process each image
      for (let i = 0; i < productImages.length; i++) {
        // Switch to this image
        setCurrentImageIndex(i)

        // Small delay to ensure the component re-renders
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Generate and download the image
        const dataUrl = await toPng(editorRef.current, {
          quality: 0.95,
          pixelRatio: 2,
        })

        const link = document.createElement("a")
        link.download = `instagram-${previewMode}-${i + 1}.png`
        link.href = dataUrl
        link.click()

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    } catch (error) {
      console.error("Error generating images:", error)
    } finally {
      // Reset printing mode and restore original image
      setPrinting(false)
      setCurrentImageIndex(originalIndex)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardContent className="p-6">
          <Tabs defaultValue="upload" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger
                value="upload"
                className={activeTab === "upload" ? "font-bold border-b-2 border-rose-500" : ""}
              >
                Upload
              </TabsTrigger>
              <TabsTrigger value="text" className={activeTab === "text" ? "font-bold border-b-2 border-rose-500" : ""}>
                Text
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className={activeTab === "export" ? "font-bold border-b-2 border-rose-500" : ""}
              >
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Product Images
                </h3>

                <div className="flex flex-col space-y-4">
                  {/* Hidden file input for product images */}
                  <input
                    type="file"
                    ref={productImageInputRef}
                    onChange={handleProductImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center bg-[#f8d7da] hover:bg-[#f5c6cb] text-rose-700 border-rose-300"
                    onClick={() => productImageInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Product Image
                  </Button>
                </div>

                {productImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Uploaded Images ({productImages.length})</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {productImages.map((file, index) => (
                        <div
                          key={index}
                          className={`relative rounded-md overflow-hidden border-2 ${currentImageIndex === index ? "border-rose-500" : "border-transparent"}`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`Product ${index + 1}`}
                            className="w-full h-16 object-cover"
                          />
                          <button
                            className="absolute top-0 right-0 bg-black bg-opacity-50 p-1 text-white rounded-bl-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage(index)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Layers className="mr-2 h-5 w-5" />
                  Branding Frame
                </h3>

                <div className="flex flex-col space-y-4">
                  {/* Hidden file input for branding frame */}
                  <input
                    type="file"
                    ref={brandingFrameInputRef}
                    onChange={handleBrandingFrameUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center bg-[#f8d7da] hover:bg-[#f5c6cb] text-rose-700 border-rose-300"
                    onClick={() => brandingFrameInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Branding Frame
                  </Button>
                </div>

                {brandingFrame && (
                  <div className="mt-4 relative">
                    <h4 className="text-sm font-medium mb-2">Uploaded Frame</h4>
                    <div className="relative rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={URL.createObjectURL(brandingFrame) || "/placeholder.svg"}
                        alt="Branding frame"
                        className="w-full h-32 object-contain bg-gray-100"
                      />
                      <button
                        className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 text-white rounded-md"
                        onClick={handleRemoveFrame}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <ImagePlus className="mr-2 h-5 w-5" />
                  Overlay Images
                </h3>
                <OverlayImageUploader
                  overlayImages={getCurrentOverlayImages()}
                  selectedId={selectedOverlayId}
                  onSelect={setSelectedOverlayId}
                  onAdd={addOverlayImage}
                  onRemove={removeOverlayImage}
                  onScaleChange={(id, scale) => updateOverlayImage(id, { scale })}
                  onMoveUp={moveOverlayImageUp}
                  onMoveDown={moveOverlayImageDown}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Image Positioning</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="image-scale" className="flex-shrink-0 mr-2">
                      Image Scale:
                    </Label>
                    <div className="flex items-center space-x-2 flex-1">
                      <Slider
                        id="image-scale"
                        min={0.5}
                        max={2}
                        step={0.01}
                        value={[imageSettings[currentImageIndex]?.scale || 1]}
                        onValueChange={(value) => updateCurrentImageSettings({ scale: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="50"
                        max="200"
                        value={Math.round((imageSettings[currentImageIndex]?.scale || 1) * 100)}
                        onChange={handleScaleInputChange}
                        className="w-16 text-right"
                      />
                      <span className="text-sm">%</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCurrentImageSettings({ scale: 1 })}
                      className="ml-2"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium flex items-center">
                  <Type className="mr-2 h-5 w-5" />
                  Text Elements
                </h3>
                <Button
                  onClick={() => setEnableImagePositioningInTextTab(!enableImagePositioningInTextTab)}
                  size="sm"
                  variant={enableImagePositioningInTextTab ? "default" : "outline"}
                  className={`flex items-center ${enableImagePositioningInTextTab ? "" : "bg-[#f8d7da] hover:bg-[#f5c6cb] text-rose-700 border-rose-300"}`}
                >
                  {enableImagePositioningInTextTab ? "Disable" : "Enable"} Image Positioning
                </Button>
              </div>

              <TextElementsList
                textElements={getCurrentTextElements()}
                selectedId={selectedTextId}
                onSelect={setSelectedTextId}
                onAdd={addNewTextElement}
                onRemove={removeTextElement}
                onMoveUp={moveTextElementUp}
                onMoveDown={moveTextElementDown}
              />

              <Separator />

              {selectedTextElement && (
                <TextEditor
                  text={selectedTextElement?.text || ""}
                  setText={(text) => updateTextElement(selectedTextElement.id, { text })}
                  textStyle={selectedTextElement?.style || {}}
                  setTextStyle={(style) => updateTextElement(selectedTextElement.id, { style })}
                  textPosition={selectedTextElement?.position || { x: 0, y: 0 }}
                  setTextPosition={(position) => updateTextElement(selectedTextElement.id, { position })}
                  onFontSizeChange={handleFontSizeInputChange}
                />
              )}
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Preview Mode</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={previewMode === "square" ? "default" : "outline"}
                    onClick={() => setPreviewMode("square")}
                    className="flex-1"
                  >
                    Square (1:1)
                  </Button>
                  <Button
                    variant={previewMode === "story" ? "default" : "outline"}
                    onClick={() => setPreviewMode("story")}
                    className="flex-1"
                  >
                    Story (9:16)
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Export Options</h3>
                <div className="space-y-2">
                  <Button onClick={handleDownload} className="w-full" disabled={!productImages.length}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Current Image
                  </Button>
                  <Button
                    onClick={handleBatchDownload}
                    variant="outline"
                    className="w-full"
                    disabled={productImages.length <= 1}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All Images
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>

          {productImages.length > 0 ? (
            <div className="flex flex-col items-center">
              <div
                ref={editorRef}
                className={`relative bg-gray-100 overflow-hidden ${
                  previewMode === "square" ? "w-full max-w-lg aspect-square" : "w-full max-w-md aspect-[9/16]"
                }`}
              >
                <ImageEditor
                  productImage={productImages[currentImageIndex]}
                  brandingFrame={brandingFrame}
                  overlayImages={getCurrentOverlayImages()}
                  selectedOverlayId={selectedOverlayId}
                  setSelectedOverlayId={setSelectedOverlayId}
                  updateOverlayPosition={(id, position) => updateOverlayImage(id, { position })}
                  updateOverlayScale={(id, scale) => updateOverlayImage(id, { scale })}
                  textElements={getCurrentTextElements()}
                  selectedTextId={selectedTextId}
                  setSelectedTextId={setSelectedTextId}
                  updateTextPosition={updateSelectedTextPosition}
                  previewMode={previewMode}
                  removeBackground={removeBackground}
                  apiKey={apiKey}
                  imagePosition={imageSettings[currentImageIndex]?.position || { x: 0, y: 0 }}
                  setImagePosition={(position) => updateCurrentImageSettings({ position })}
                  imageScale={imageSettings[currentImageIndex]?.scale || 1}
                  setImageScale={(scale) => updateCurrentImageSettings({ scale })}
                  isEditingImage={activeTab === "upload" || enableImagePositioningInTextTab}
                  setIsEditingImage={setIsEditingImage}
                  isPrinting={isPrinting}
                />
              </div>

              <div className="mt-4 flex justify-between w-full max-w-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                  disabled={productImages.length <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  {currentImageIndex + 1} of {productImages.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                  disabled={productImages.length <= 1}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-200 rounded-lg">
              <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Upload product images to start</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
