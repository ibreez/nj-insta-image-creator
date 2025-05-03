import type { Metadata } from "next"
import ImageGenerator from "@/components/image-generator"

export const metadata: Metadata = {
  title: "Instagram Image Generator",
  description: "Generate Instagram-ready images with custom branding frames and text overlays",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-rose-600">Instagram Image Generator</h1>
        <p className="text-center text-gray-600 mb-8">
          Transform your product photos into Instagram-ready posts with custom branding
        </p>
        <ImageGenerator />
      </div>
    </main>
  )
}
