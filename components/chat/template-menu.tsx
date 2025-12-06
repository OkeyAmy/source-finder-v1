"use client"

import { X, Send, ArrowRightLeft, Rocket, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TemplateMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: string) => void
}

export function TemplateMenu({ isOpen, onClose, onSelectTemplate }: TemplateMenuProps) {
  if (!isOpen) return null

  const templates = [
    {
      id: "transfer",
      icon: Send,
      label: "Transfer",
      template: "Transfer [amount] [token] to [address]",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "swap",
      icon: ArrowRightLeft,
      label: "Swap",
      template: "Swap [amount] [fromToken] for [toToken]",
      color: "bg-green-100 text-green-600",
    },
    {
      id: "deploy",
      icon: Rocket,
      label: "Deploy",
      template: "Deploy a new ERC-20 token contract",
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "call",
      icon: Phone,
      label: "Contract Call",
      template: "Call [function] on contract [address]",
      color: "bg-amber-100 text-amber-600",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Insert Template</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTemplate(t.template)
                onClose()
              }}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.color}`}>
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-500 font-mono">{t.template}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
