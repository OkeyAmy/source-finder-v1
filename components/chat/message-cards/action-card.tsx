"use client"

import { AlertTriangle, Check, X, Fuel, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActionPreview } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ActionCardProps {
  data: ActionPreview
  onPreview: () => void
  onExecute: () => void
}

export function ActionCard({ data, onPreview, onExecute }: ActionCardProps) {
  const isBlocked = data.isDenied || !data.isAllowed || data.spendCapUsage.amount > data.spendCapUsage.total

  return (
    <div
      className={cn(
        "rounded-2xl p-4 space-y-4 border",
        isBlocked ? "bg-red-50 border-red-200" : "bg-white border-gray-200",
      )}
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">{data.title}</h4>
        {data.gasSponsored && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            Gas Sponsored
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-gray-700 text-sm">{data.summary}</p>

      {/* Details Grid */}
      <div className="space-y-3">
        {/* Spend Cap */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Spend Cap Usage</span>
            <span
              className={cn(
                "text-sm font-medium",
                data.spendCapUsage.amount > data.spendCapUsage.total ? "text-red-600" : "text-gray-900",
              )}
            >
              {data.spendCapUsage.amount} / {data.spendCapUsage.total} {data.spendCapUsage.token}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                data.spendCapUsage.amount > data.spendCapUsage.total ? "bg-red-500" : "bg-amber-500",
              )}
              style={{ width: `${Math.min((data.spendCapUsage.amount / data.spendCapUsage.total) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{data.spendCapUsage.remaining} remaining after this action</p>
        </div>

        {/* Allow/Deny Status */}
        <div className="flex items-center gap-2">
          {data.isDenied ? (
            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full">
              <X className="h-3 w-3" />
              Address Denied
            </span>
          ) : data.isAllowed ? (
            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
              <Check className="h-3 w-3" />
              Address Allowed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
              Unknown Address
            </span>
          )}

          <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
            <Shield className="h-3 w-3" />
            {data.policyName}
          </span>
        </div>

        {/* Gas Estimate */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Gas Estimate</span>
          <span className="text-gray-900">{data.gasEstimate}</span>
        </div>

        {/* Risk Warnings */}
        {data.riskWarnings.length > 0 && (
          <div className="space-y-2">
            {data.riskWarnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle
                  className={cn(
                    "h-4 w-4 flex-shrink-0 mt-0.5",
                    warning.includes("BLOCKED") ? "text-red-500" : "text-amber-500",
                  )}
                />
                <span className={cn(warning.includes("BLOCKED") ? "text-red-700" : "text-amber-700")}>{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 rounded-xl bg-transparent" onClick={onPreview}>
          Preview Details
        </Button>
        <Button
          className={cn(
            "flex-1 rounded-xl",
            isBlocked ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 text-white",
          )}
          disabled={isBlocked}
          onClick={onExecute}
        >
          {isBlocked ? "Blocked" : "Execute Action"}
        </Button>
      </div>
    </div>
  )
}
