"use client"

import { X, FileCode, FileJson, Code, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionMenuProps {
  isOpen: boolean
  onClose: () => void
  onAction: (action: string) => void
}

export function QuickActionMenu({ isOpen, onClose, onAction }: QuickActionMenuProps) {
  if (!isOpen) return null

  const actions = [
    { id: "contract-address", icon: FileCode, label: "Provide Contract Address", color: "bg-blue-100 text-blue-600" },
    { id: "paste-code", icon: Code, label: "Paste Contract Code", color: "bg-purple-100 text-purple-600" },
    { id: "upload-abi", icon: FileJson, label: "Upload ABI / JSON", color: "bg-green-100 text-green-600" },
    { id: "template", icon: Layers, label: "Insert Template", color: "bg-amber-100 text-amber-600" },
  ]

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 min-w-[220px]">
      <div className="flex items-center justify-between px-2 py-1 mb-1">
        <span className="text-xs font-medium text-gray-500">Quick Actions</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              onAction(action.id)
              onClose()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-sm text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
