"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ImagePlus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import type { OverlayImage } from "@/types/overlay-image"

interface OverlayImageUploaderProps {
  overlayImages: OverlayImage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (file: File) => void
  onRemove: (id: string) => void
  onScaleChange?: (id: string, scale: number) => void
  onMoveUp?: (id: string) => void
  onMoveDown?: (id: string) => void
}

export function OverlayImageUploader({
  overlayImages,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  onScaleChange,
  onMoveUp,
  onMoveDown,
}: OverlayImageUploaderProps) {
  // File input ref for overlay images
  const overlayImageInputRef = useRef<HTMLInputElement>(null)

  // Sort overlay images by zIndex
  const sortedOverlays = [...overlayImages].sort((a, b) => a.zIndex - b.zIndex)

  const handleScaleChange = (id: string, value: number[]) => {
    if (onScaleChange) {
      onScaleChange(id, value[0])
    }
  }

  const handleOverlayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    if (file && file.type.startsWith("image/")) {
      onAdd(file)
    }

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {/* Hidden file input for overlay images */}
        <input
          type="file"
          ref={overlayImageInputRef}
          onChange={handleOverlayImageUpload}
          accept="image/*"
          className="hidden"
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex items-center bg-[#f8d7da] hover:bg-[#f5c6cb] text-rose-700 border-rose-300"
          onClick={() => overlayImageInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4 mr-1" />
          Add Overlay Image
        </Button>
      </div>

      {sortedOverlays.length > 0 ? (
        <ScrollArea className="h-[180px] border rounded-md p-2">
          <div className="space-y-4">
            {sortedOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`p-3 rounded-md ${
                  selectedId === overlay.id
                    ? "bg-rose-100 border border-rose-300"
                    : "hover:bg-gray-100 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between cursor-pointer" onClick={() => onSelect(overlay.id)}>
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={URL.createObjectURL(overlay.file) || "/placeholder.svg"}
                        alt="Overlay"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium truncate max-w-[150px]">{overlay.file.name}</div>
                      <div className="text-xs text-gray-500">Layer: {overlay.zIndex}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {onMoveUp && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveUp(overlay.id)
                        }}
                        title="Move Up"
                      >
                        <ArrowUp className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      </Button>
                    )}
                    {onMoveDown && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveDown(overlay.id)
                        }}
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(overlay.id)
                      }}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                  </div>
                </div>

                {selectedId === overlay.id && onScaleChange && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs whitespace-nowrap">Scale:</Label>
                      <Slider
                        min={0.2}
                        max={2}
                        step={0.01}
                        value={[overlay.scale]}
                        onValueChange={(value) => handleScaleChange(overlay.id, value)}
                        className="flex-1"
                      />
                      <div className="text-xs font-medium w-12 text-right">{Math.round(overlay.scale * 100)}%</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Drag the image on canvas to position it</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-[120px] border rounded-md p-4">
          <p className="text-gray-500 text-sm">No overlay images added yet</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 flex items-center justify-center bg-[#f8d7da] hover:bg-[#f5c6cb] text-rose-700 border-rose-300"
            onClick={() => overlayImageInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-1" />
            Add Overlay Image
          </Button>
        </div>
      )}
    </div>
  )
}
