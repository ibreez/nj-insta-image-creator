"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Type, ArrowUp, ArrowDown } from "lucide-react"
import type { TextElement } from "@/types/text-element"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TextElementsListProps {
  textElements: TextElement[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onMoveUp?: (id: string) => void
  onMoveDown?: (id: string) => void
}

export function TextElementsList({
  textElements,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
}: TextElementsListProps) {
  // Sort text elements by zIndex
  const sortedElements = [...textElements].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <Type className="mr-2 h-5 w-5" />
          Text Elements
        </h3>
        <Button onClick={onAdd} size="sm" variant="outline" className="flex items-center">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Text
        </Button>
      </div>

      {sortedElements.length > 0 ? (
        <ScrollArea className="h-[120px] border rounded-md p-2">
          <div className="space-y-2">
            {sortedElements.map((element) => (
              <div
                key={element.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                  selectedId === element.id ? "bg-rose-100 border border-rose-300" : "hover:bg-gray-100"
                }`}
                onClick={() => onSelect(element.id)}
              >
                <div className="flex-1 truncate">
                  <div
                    className="text-sm font-medium truncate"
                    style={{
                      fontFamily: element.style.fontFamily,
                      fontWeight: element.style.isBold ? "bold" : "normal",
                      fontStyle: element.style.isItalic ? "italic" : "normal",
                    }}
                  >
                    {element.text || "(Empty text)"}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-2">
                    <span>{element.style.fontSize}px</span>
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: element.style.color }}
                    ></span>
                    <span>{element.style.fontFamily}</span>
                    <span className="ml-auto">Layer: {element.zIndex}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {onMoveUp && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveUp(element.id)
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
                        onMoveDown(element.id)
                      }}
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </Button>
                  )}
                  {textElements.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(element.id)
                      }}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-[120px] border rounded-md p-4">
          <p className="text-gray-500 text-sm">No text elements added yet</p>
          <Button onClick={onAdd} size="sm" variant="outline" className="mt-2">
            Add Text Element
          </Button>
        </div>
      )}
    </div>
  )
}
