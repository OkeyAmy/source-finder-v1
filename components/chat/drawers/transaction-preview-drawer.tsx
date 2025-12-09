"use client"

import { X, Shield, Fuel, AlertTriangle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActionPreview } from "@/lib/types"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TransactionPreviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  data: ActionPreview | null
  onExecute: () => void
}

export function TransactionPreviewDrawer({ isOpen, onClose, data, onExecute }: TransactionPreviewDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!isOpen || !data) return null

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const isBlocked = data.isDenied || !data.isAllowed || data.spendCapUsage.amount > data.spendCapUsage.total

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b">
          <h3 className="font-semibold text-gray-900">Transaction Preview</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">{data.title}</h4>
            <p className="text-sm text-gray-600">{data.summary}</p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-500">Network</span>
              <span className="text-sm font-medium text-gray-900">
                {data.network === "bsc" ? "BNB Testnet" : "BNB Mainnet"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-500">From Wallet</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-900">{data.fromWallet}</span>
                <button
                  onClick={() => copyToClipboard(data.fromWallet, "from")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copiedField === "from" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {data.toAddress && (
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-gray-500">To Address</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{data.toAddress}</span>
                  <button
                    onClick={() => copyToClipboard(data.toAddress!, "to")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedField === "to" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-500">Policy Applied</span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <Shield className="h-4 w-4" />
                {data.policyName}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-500">Gas Cost</span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                {data.gasSponsored && <Fuel className="h-4 w-4 text-green-500" />}
                {data.gasEstimate}
                {data.gasSponsored && <span className="text-xs text-green-600">(Sponsored)</span>}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-500">Estimated Impact</span>
              <span className="text-sm font-medium text-gray-900">
                {data.spendCapUsage.amount} {data.spendCapUsage.token}
              </span>
            </div>
          </div>

          {/* Risk Analysis */}
          {data.riskWarnings.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Analysis
              </h4>
              <ul className="space-y-2">
                {data.riskWarnings.map((warning, index) => (
                  <li
                    key={index}
                    className={cn("text-sm", warning.includes("BLOCKED") ? "text-red-700" : "text-amber-700")}
                  >
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw Data */}
          {data.rawData && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Raw Data</h4>
                <button
                  onClick={() => copyToClipboard(data.rawData!, "raw")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copiedField === "raw" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs font-mono text-gray-600 break-all">{data.rawData}</p>
            </div>
          )}

          {/* ABI Call */}
          {data.abiCall && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">ABI Call</h4>
              <p className="text-sm font-mono text-gray-600">{data.abiCall}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white">
          <Button
            className={cn(
              "w-full rounded-xl h-12",
              isBlocked ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 text-white",
            )}
            disabled={isBlocked}
            onClick={onExecute}
          >
            {isBlocked ? "Transaction Blocked" : "Confirm & Execute"}
          </Button>
        </div>
      </div>
    </>
  )
}
