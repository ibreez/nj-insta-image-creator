"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink } from "lucide-react"

interface RemoveBackgroundDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (apiKey: string) => void
  apiKey: string
}

export function RemoveBackgroundDialog({
  open,
  onClose,
  onConfirm,
  apiKey: initialApiKey,
}: RemoveBackgroundDialogProps) {
  const [apiKey, setApiKey] = useState(initialApiKey)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(apiKey)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Background Removal API Key</DialogTitle>
          <DialogDescription>
            Enter your remove.bg API key to enable background removal. You can get a free API key from remove.bg.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key" className="col-span-4">
                API Key
              </Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your remove.bg API key"
                className="col-span-4"
              />
            </div>
            <div className="flex items-center">
              <a
                href="https://www.remove.bg/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-rose-600 hover:underline flex items-center"
              >
                Get an API key
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
