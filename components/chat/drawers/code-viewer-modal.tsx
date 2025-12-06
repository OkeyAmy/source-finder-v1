"use client"

import { X, Download, Copy, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface CodeViewerModalProps {
  isOpen: boolean
  onClose: () => void
  code: string | null
  onAudit: () => void
}

export function CodeViewerModal({ isOpen, onClose, code, onAudit }: CodeViewerModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !code) return null

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contract.sol"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    return code
      .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
      .replace(
        /(pragma|contract|function|modifier|event|mapping|struct|enum|import|library|interface|constructor|returns|return|if|else|for|while|do|break|continue|throw|require|revert|assert|emit|new|delete|external|public|private|internal|pure|view|payable|memory|storage|calldata|constant|immutable|virtual|override)/g,
        '<span class="text-purple-600 font-medium">$1</span>',
      )
      .replace(/(uint256|uint|int256|int|bool|address|bytes|string|bytes32)/g, '<span class="text-blue-600">$1</span>')
      .replace(/(".*?")/g, '<span class="text-green-600">$1</span>')
      .replace(/(\d+)/g, '<span class="text-amber-600">$1</span>')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Contract Code</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadCode}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyCode}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <pre className="text-sm font-mono leading-relaxed">
            <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white" onClick={onAudit}>
            <Search className="h-4 w-4 mr-2" />
            Audit This Code
          </Button>
        </div>
      </div>
    </div>
  )
}
