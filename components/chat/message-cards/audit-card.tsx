"use client"

import { useState } from "react"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AuditResponse, RiskLevel } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AuditCardProps {
  data: AuditResponse
  onAction: (action: string) => void
  onViewFullReport: () => void
}

const riskConfig: Record<RiskLevel, { color: string; bgColor: string; icon: typeof Shield; label: string }> = {
  low: { color: "text-green-600", bgColor: "bg-green-100", icon: ShieldCheck, label: "Low Risk" },
  medium: { color: "text-amber-600", bgColor: "bg-amber-100", icon: Shield, label: "Medium Risk" },
  high: { color: "text-orange-600", bgColor: "bg-orange-100", icon: ShieldAlert, label: "High Risk" },
  critical: { color: "text-red-600", bgColor: "bg-red-100", icon: ShieldAlert, label: "Critical Risk" },
}

export function AuditCard({ data, onAction, onViewFullReport }: AuditCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["critical"]))
  const config = riskConfig[data.riskLevel]
  const RiskIcon = config.icon

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-200">
      {/* Risk Badge */}
      <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full", config.bgColor)}>
        <RiskIcon className={cn("h-5 w-5", config.color)} />
        <span className={cn("font-semibold", config.color)}>{config.label}</span>
      </div>

      {/* Summary */}
      <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>

      {/* Issues Sections */}
      <div className="space-y-2">
        {/* Critical Issues */}
        {data.criticalIssues.length > 0 && (
          <div className="bg-red-50 rounded-xl overflow-hidden border border-red-100">
            <button
              onClick={() => toggleSection("critical")}
              className="w-full flex items-center justify-between p-3 hover:bg-red-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-900">Critical Issues ({data.criticalIssues.length})</span>
              </div>
              {expandedSections.has("critical") ? (
                <ChevronUp className="h-4 w-4 text-red-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-400" />
              )}
            </button>
            {expandedSections.has("critical") && (
              <div className="border-t border-red-100 divide-y divide-red-100">
                {data.criticalIssues.map((issue, index) => (
                  <div key={index} className="p-3">
                    <p className="font-medium text-red-900 text-sm">{issue.title}</p>
                    <p className="text-red-700 text-xs mt-1">{issue.description}</p>
                    {issue.lineNumber && <p className="text-red-500 text-xs mt-1 font-mono">Line {issue.lineNumber}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {data.warnings.length > 0 && (
          <div className="bg-amber-50 rounded-xl overflow-hidden border border-amber-100">
            <button
              onClick={() => toggleSection("warnings")}
              className="w-full flex items-center justify-between p-3 hover:bg-amber-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-900">Warnings ({data.warnings.length})</span>
              </div>
              {expandedSections.has("warnings") ? (
                <ChevronUp className="h-4 w-4 text-amber-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-amber-400" />
              )}
            </button>
            {expandedSections.has("warnings") && (
              <div className="border-t border-amber-100 divide-y divide-amber-100">
                {data.warnings.map((issue, index) => (
                  <div key={index} className="p-3">
                    <p className="font-medium text-amber-900 text-sm">{issue.title}</p>
                    <p className="text-amber-700 text-xs mt-1">{issue.description}</p>
                    {issue.lineNumber && (
                      <p className="text-amber-500 text-xs mt-1 font-mono">Line {issue.lineNumber}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Notes */}
        {data.infoNotes.length > 0 && (
          <div className="bg-blue-50 rounded-xl overflow-hidden border border-blue-100">
            <button
              onClick={() => toggleSection("info")}
              className="w-full flex items-center justify-between p-3 hover:bg-blue-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Info Notes ({data.infoNotes.length})</span>
              </div>
              {expandedSections.has("info") ? (
                <ChevronUp className="h-4 w-4 text-blue-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-blue-400" />
              )}
            </button>
            {expandedSections.has("info") && (
              <div className="border-t border-blue-100 divide-y divide-blue-100">
                {data.infoNotes.map((issue, index) => (
                  <div key={index} className="p-3">
                    <p className="font-medium text-blue-900 text-sm">{issue.title}</p>
                    <p className="text-blue-700 text-xs mt-1">{issue.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Full Report Button */}
      <Button variant="outline" className="w-full rounded-xl bg-transparent" onClick={onViewFullReport}>
        View Full Audit Report
      </Button>

      {/* Action Chips */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs bg-transparent"
          onClick={() => onAction("deploy-safe")}
        >
          Deploy Safe Version
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs bg-transparent"
          onClick={() => onAction("run-tx")}
        >
          Run Transaction
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs bg-transparent"
          onClick={() => onAction("continue")}
        >
          Continue Actions
        </Button>
      </div>
    </div>
  )
}
