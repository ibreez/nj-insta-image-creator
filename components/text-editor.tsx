"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TextStyle } from "@/types/text-style"

interface TextEditorProps {
  text: string
  setText: (text: string) => void
  textStyle: TextStyle
  setTextStyle: (style: TextStyle) => void
  textPosition: { x: number; y: number }
  setTextPosition: (position: { x: number; y: number }) => void
  onFontSizeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// List of web-safe fonts
const fontOptions = [
  { value: "Arial", label: "Arial" },
  { value: "Cambria", label: "Cambria" },
  { value: "Verdana", label: "Verdana" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Garamond", label: "Garamond" },
  { value: "Courier New", label: "Courier New" },
  { value: "Brush Script MT", label: "Brush Script MT" },
]

export default function TextEditor({
  text,
  setText,
  textStyle,
  setTextStyle,
  textPosition,
  setTextPosition,
  onFontSizeChange,
}: TextEditorProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextStyle({ ...textStyle, color: e.target.value })
  }

  const handleFontSizeChange = (value: number[]) => {
    setTextStyle({ ...textStyle, fontSize: value[0] })
  }

  const handleFontFamilyChange = (value: string) => {
    setTextStyle({ ...textStyle, fontFamily: value })
  }

  const handleBoldToggle = () => {
    setTextStyle({ ...textStyle, isBold: !textStyle.isBold })
  }

  const handleItalicToggle = () => {
    setTextStyle({ ...textStyle, isItalic: !textStyle.isItalic })
  }

  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    setTextStyle({ ...textStyle, alignment })
  }

  const handlePositionReset = () => {
    setTextPosition({ x: 50, y: 50 })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <Type className="mr-2 h-5 w-5" />
          Text Content
        </h3>
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your promotional text"
          className="min-h-[100px]"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Press Enter to add a new line. Text will be displayed exactly as entered.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Font</h3>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="font-family">Font Family</Label>
            <Select value={textStyle.fontFamily} onValueChange={handleFontFamilyChange}>
              <SelectTrigger id="font-family" className="w-full">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex mt-1">
                <Input
                  id="text-color"
                  type="color"
                  value={textStyle.color}
                  onChange={handleColorChange}
                  className="w-12 h-10 p-1"
                />
                <Input type="text" value={textStyle.color} onChange={handleColorChange} className="flex-1 ml-2" />
              </div>
            </div>

            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Slider
                  id="font-size"
                  min={12}
                  max={120}
                  step={1}
                  value={[textStyle.fontSize]}
                  onValueChange={handleFontSizeChange}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="12"
                  max="120"
                  value={textStyle.fontSize}
                  onChange={onFontSizeChange}
                  className="w-16 text-right"
                />
                <span className="text-sm">px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Text Formatting</h3>
        <div className="flex space-x-2">
          <Button
            variant={textStyle.isBold ? "default" : "outline"}
            size="icon"
            onClick={handleBoldToggle}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant={textStyle.isItalic ? "default" : "outline"}
            size="icon"
            onClick={handleItalicToggle}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="border-l mx-1"></div>

          <Button
            variant={textStyle.alignment === "left" ? "default" : "outline"}
            size="icon"
            onClick={() => handleAlignmentChange("left")}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>

          <Button
            variant={textStyle.alignment === "center" ? "default" : "outline"}
            size="icon"
            onClick={() => handleAlignmentChange("center")}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>

          <Button
            variant={textStyle.alignment === "right" ? "default" : "outline"}
            size="icon"
            onClick={() => handleAlignmentChange("right")}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Text Position</h3>
        <p className="text-sm text-gray-500 mb-2">
          Drag the text directly on the preview to position it, or use the controls below.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <Label htmlFor="text-x">Horizontal: {Math.round(textPosition.x)}%</Label>
            <Slider
              id="text-x"
              min={0}
              max={100}
              step={1}
              value={[textPosition.x]}
              onValueChange={(value) => setTextPosition({ ...textPosition, x: value[0] })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="text-y">Vertical: {Math.round(textPosition.y)}%</Label>
            <Slider
              id="text-y"
              min={0}
              max={100}
              step={1}
              value={[textPosition.y]}
              onValueChange={(value) => setTextPosition({ ...textPosition, y: value[0] })}
              className="mt-2"
            />
          </div>
        </div>
        <Button variant="outline" onClick={handlePositionReset} className="w-full">
          Reset Text Position
        </Button>
      </div>
    </div>
  )
}
