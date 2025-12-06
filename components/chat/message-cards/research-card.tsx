"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ResearchResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ResearchCardProps {
  data: ResearchResponse
  onAction: (action: string) => void
}

export function ResearchCard({ data, onAction }: ResearchCardProps) {
  const [showHolders, setShowHolders] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (data.tokenDetails?.contractAddress) {
      navigator.clipboard.writeText(data.tokenDetails.contractAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-blue-50/50 rounded-2xl p-4 space-y-4 border border-blue-100">
      {/* Summary */}
      <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>

      {/* Token Details Grid */}
      {data.tokenDetails && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Token Name</p>
            <p className="font-medium text-gray-900">{data.tokenDetails.name}</p>
          </div>
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Symbol</p>
            <p className="font-medium text-gray-900">{data.tokenDetails.symbol}</p>
          </div>
          <div className="bg-white rounded-xl p-3 col-span-2">
            <p className="text-xs text-gray-500 mb-1">Contract Address</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-gray-900 truncate">{data.tokenDetails.contractAddress}</p>
              <button onClick={copyAddress} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {data.tokenDetails.marketCap && (
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Market Cap</p>
              <p className="font-medium text-gray-900">{data.tokenDetails.marketCap}</p>
            </div>
          )}
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Holders</p>
            <p className="font-medium text-gray-900">{data.tokenDetails.holderCount.toLocaleString()}</p>
          </div>
          {data.tokenDetails.liquidity && (
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Liquidity</p>
              <p className="font-medium text-gray-900">{data.tokenDetails.liquidity}</p>
            </div>
          )}
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Verified</p>
            <p className={cn("font-medium", data.tokenDetails.verified ? "text-green-600" : "text-red-600")}>
              {data.tokenDetails.verified ? "Yes" : "No"}
            </p>
          </div>
        </div>
      )}

      {/* Top Holders Expandable */}
      {data.tokenDetails?.topHolders && data.tokenDetails.topHolders.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden">
          <button
            onClick={() => setShowHolders(!showHolders)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900 text-sm">Top Holders</span>
            {showHolders ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {showHolders && (
            <div className="border-t divide-y">
              {data.tokenDetails.topHolders.map((holder, index) => (
                <div key={holder.address} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4">#{index + 1}</span>
                    <div>
                      <p className="font-mono text-sm text-gray-900">{holder.address}</p>
                      <div className="flex gap-1 mt-1">
                        {holder.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">{holder.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs bg-transparent"
          onClick={() => onAction("audit")}
        >
          Audit Contract
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs bg-transparent"
          onClick={() => onAction("view-code")}
        >
          View Contract Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs bg-transparent"
          onClick={() => onAction("swap")}
        >
          Simulate Swap
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs bg-transparent"
          onClick={() => onAction("transfer")}
        >
          Transfer Tokens
        </Button>
      </div>
    </div>
  )
}
