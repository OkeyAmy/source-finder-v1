"use client"

import { X, RefreshCw, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onNewSession: (keepPolicies: boolean) => void
}

export function NewSessionModal({ isOpen, onClose, onNewSession }: NewSessionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Start New Session</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          This will clear the current chat history. Choose how you want to start your new session.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNewSession(true)}
            className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Keep Wallet & Policies</p>
              <p className="text-sm text-gray-500">Start fresh with current settings</p>
            </div>
          </button>

          <button
            onClick={() => onNewSession(false)}
            className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Fresh Policies</p>
              <p className="text-sm text-gray-500">Reset spend caps and lists</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
