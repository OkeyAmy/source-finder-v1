"use client"

import { Loader2 } from "lucide-react"

interface ThinkingBubbleProps {
  step: string
}

export function ThinkingBubble({ step }: ThinkingBubbleProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-2xl rounded-tl-none max-w-[80%]">
      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      <span className="text-sm text-gray-600">{step}</span>
    </div>
  )
}
