import type { TextStyle } from "./text-style"

export interface TextElement {
  id: string
  text: string
  position: { x: number; y: number }
  style: TextStyle
  zIndex: number
}
