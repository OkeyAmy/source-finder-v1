"use client"

import "ios-vibrator-pro-max"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Plus, ArrowUp, Menu, RotateCcw, Zap, RefreshCcw, Copy, Share2, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Network, Mode, ChatMessage, ResearchResponse, AuditResponse, ActionPreview } from "@/lib/types"
import { SlidePanel } from "@/components/chat/slide-panel"
import { NewSessionModal } from "@/components/chat/new-session-modal"
import { QuickActionMenu } from "@/components/chat/quick-action-menu"
import { TemplateMenu } from "@/components/chat/template-menu"
import { ResearchCard } from "@/components/chat/message-cards/research-card"
import { AuditCard } from "@/components/chat/message-cards/audit-card"
import { ActionCard } from "@/components/chat/message-cards/action-card"
import { TransactionPreviewDrawer } from "@/components/chat/drawers/transaction-preview-drawer"
import { CodeViewerModal } from "@/components/chat/drawers/code-viewer-modal"
import { ThinkingBubble } from "@/components/chat/thinking-bubble"

// Simulation Data
import { tokenResearchSimulation, researchThinkingSteps } from "@/data/simulation/research-flows"
import {
  safeContractAuditSimulation,
  riskyContractAuditSimulation,
  auditThinkingSteps,
} from "@/data/simulation/audit-flows"
import {
  transferActionSimulation,
  swapActionSimulation,
  deniedActionSimulation,
  actionThinkingSteps,
} from "@/data/simulation/action-flows"

// Rotating placeholders
const PLACEHOLDERS = [
  "Explain this token and show top holders",
  "Audit a smart contract",
  "Deploy a contract using one signature",
  "Transfer 10 USDT to 0xabc...",
  "Simulate a BNB swap",
]

export default function ChatInterface() {
  // State
  const [inputValue, setInputValue] = useState("")
  const [hasTyped, setHasTyped] = useState(false)
  const [activeMode, setActiveMode] = useState<Mode>("research")
  const [network, setNetwork] = useState<Network>("bnb-testnet")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingStep, setThinkingStep] = useState<string | null>(null)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  // UI State
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false)
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false)
  const [isQuickActionMenuOpen, setIsQuickActionMenuOpen] = useState(false)
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false)
  const [previewDrawerData, setPreviewDrawerData] = useState<ActionPreview | null>(null)
  const [codeViewerData, setCodeViewerData] = useState<string | null>(null)

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const mainContainerRef = useRef<HTMLDivElement>(null)

  // Viewport
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
      const vh = window.innerHeight
      setViewportHeight(vh)
      if (isMobileDevice && mainContainerRef.current) {
        mainContainerRef.current.style.height = `${vh}px`
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, thinkingStep])

  // Simulate streaming thinking steps
  const simulateThinking = async (steps: string[]) => {
    for (const step of steps) {
      setThinkingStep(step)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }
    setThinkingStep(null)
  }

  // Determine response type based on input
  const determineResponseType = (input: string): "research" | "audit" | "action" => {
    const lowerInput = input.toLowerCase()
    if (lowerInput.includes("audit") || lowerInput.includes("security") || lowerInput.includes("vulnerability")) {
      return "audit"
    }
    if (
      lowerInput.includes("transfer") ||
      lowerInput.includes("swap") ||
      lowerInput.includes("deploy") ||
      lowerInput.includes("send")
    ) {
      return "action"
    }
    return "research"
  }

  // Generate simulated response
  const generateResponse = async (userMessage: string) => {
    setIsStreaming(true)
    const responseType = activeMode === "research" ? determineResponseType(userMessage) : activeMode

    let thinkingSteps: string[]
    let responseData: {
      category: "research" | "audit" | "action"
      data: ResearchResponse | AuditResponse | ActionPreview
    }

    switch (responseType) {
      case "audit":
        thinkingSteps = auditThinkingSteps
        responseData = {
          category: "audit",
          data: userMessage.toLowerCase().includes("safe") ? safeContractAuditSimulation : riskyContractAuditSimulation,
        }
        break
      case "action":
        thinkingSteps = actionThinkingSteps
        if (userMessage.toLowerCase().includes("deny") || userMessage.toLowerCase().includes("hacker")) {
          responseData = { category: "action", data: deniedActionSimulation }
        } else if (userMessage.toLowerCase().includes("swap")) {
          responseData = { category: "action", data: swapActionSimulation }
        } else {
          responseData = { category: "action", data: transferActionSimulation }
        }
        break
      default:
        thinkingSteps = researchThinkingSteps
        responseData = { category: "research", data: tokenResearchSimulation }
    }

    // Vibrate on send
    navigator.vibrate?.(50)

    // Show thinking steps
    await simulateThinking(thinkingSteps)

    // Add agent response
    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      type: "agent",
      category: responseData.category,
      content: "",
      timestamp: new Date(),
      ...(responseData.category === "research" && { researchData: responseData.data as ResearchResponse }),
      ...(responseData.category === "audit" && { auditData: responseData.data as AuditResponse }),
      ...(responseData.category === "action" && { actionData: responseData.data as ActionPreview }),
    }

    setMessages((prev) => [...prev, agentMessage])

    // Vibrate on response
    navigator.vibrate?.(50)
    setIsStreaming(false)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      newSection: messages.length > 0,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setHasTyped(false)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    generateResponse(userMessage.content)
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isStreaming) return
    const value = e.target.value
    setInputValue(value)
    setHasTyped(value.trim() !== "")

    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    }
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isStreaming) return
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault()
      handleSubmit(e)
    }
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Handle new session
  const handleNewSession = (keepPolicies: boolean) => {
    setMessages([])
    setIsNewSessionModalOpen(false)
    navigator.vibrate?.(50)
  }

  // Handle quick action
  const handleQuickAction = (action: string) => {
    if (action === "template") {
      setIsTemplateMenuOpen(true)
    } else if (action === "contract-address") {
      setInputValue("Analyze contract 0x")
      textareaRef.current?.focus()
    } else if (action === "paste-code") {
      setInputValue("Audit this contract code:\n```\n")
      textareaRef.current?.focus()
    }
  }

  // Handle card actions
  const handleCardAction = (action: string, messageId: string) => {
    switch (action) {
      case "audit":
        setInputValue("Audit this contract")
        textareaRef.current?.focus()
        break
      case "view-code":
        const auditMsg = messages.find((m) => m.auditData?.contractCode)
        if (auditMsg?.auditData?.contractCode) {
          setCodeViewerData(auditMsg.auditData.contractCode)
        }
        break
      case "transfer":
        setInputValue("Transfer 10 USDT to ")
        textareaRef.current?.focus()
        break
      case "swap":
        setInputValue("Swap 0.5 BNB for USDT")
        textareaRef.current?.focus()
        break
    }
  }

  // Get category label
  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "research":
        return "ChainGPT Research"
      case "audit":
        return "ChainGPT Audit"
      case "action":
        return "Quack x402 Action"
      default:
        return "System Notice"
    }
  }

  return (
    <div
      ref={mainContainerRef}
      className="bg-gray-50 flex flex-col overflow-hidden"
      style={{ height: isMobile ? `${viewportHeight}px` : "100svh" }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 flex items-center px-4 z-20 bg-gray-50 border-b border-gray-100">
        <div className="w-full flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => setIsSlidePanelOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Menu</span>
          </Button>

          <div className="text-center">
            <h1 className="text-base font-semibold text-gray-900">Quack × ChainGPT Agent</h1>
            <p className="text-xs text-gray-500">
              Environment: {network === "bnb-testnet" ? "BNB Testnet" : "BNB Mainnet"}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => setIsNewSessionModalOpen(true)}
          >
            <RotateCcw className="h-5 w-5 text-gray-700" />
            <span className="sr-only">New Session</span>
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-grow pb-40 pt-16 px-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h2>
              <p className="text-gray-500 max-w-md">
                Research tokens, audit contracts, or execute transactions with AI-powered assistance.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex flex-col", message.type === "user" ? "items-end" : "items-start")}
            >
              {/* User Message */}
              {message.type === "user" && (
                <div className="max-w-[80%] px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-br-none">
                  <p className="text-gray-900">{message.content}</p>
                </div>
              )}

              {/* Agent Message */}
              {message.type === "agent" && (
                <div className="w-full max-w-[90%]">
                  {/* Category Label */}
                  <p className="text-xs text-gray-500 mb-2 font-medium">{getCategoryLabel(message.category)}</p>

                  {/* Research Card */}
                  {message.researchData && (
                    <ResearchCard
                      data={message.researchData}
                      onAction={(action) => handleCardAction(action, message.id)}
                    />
                  )}

                  {/* Audit Card */}
                  {message.auditData && (
                    <AuditCard
                      data={message.auditData}
                      onAction={(action) => handleCardAction(action, message.id)}
                      onViewFullReport={() => {
                        if (message.auditData?.contractCode) {
                          setCodeViewerData(message.auditData.contractCode)
                        }
                      }}
                    />
                  )}

                  {/* Action Card */}
                  {message.actionData && (
                    <ActionCard
                      data={message.actionData}
                      onPreview={() => setPreviewDrawerData(message.actionData!)}
                      onExecute={() => {
                        navigator.vibrate?.(100)
                        alert("Transaction would be executed via Quack x402")
                      }}
                    />
                  )}

                  {/* Message Actions */}
                  <div className="flex items-center gap-2 px-1 mt-2">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking Bubble */}
          {thinkingStep && (
            <div className="flex items-start">
              <ThinkingBubble step={thinkingStep} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Mode Chips */}
          <div className="flex items-center gap-2 mb-3">
            {(["research", "audit", "action"] as Mode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveMode(mode)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  activeMode === mode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Input Container */}
          <div
            className={cn(
              "relative w-full rounded-3xl border border-gray-200 bg-white p-3",
              isStreaming && "opacity-80",
            )}
          >
            <div className="pb-10">
              <Textarea
                ref={textareaRef}
                placeholder={isStreaming ? "Waiting for response..." : PLACEHOLDERS[placeholderIndex]}
                className="min-h-[24px] max-h-[160px] w-full rounded-3xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-2 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
              />
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8 border-gray-200 bg-transparent"
                    onClick={() => setIsQuickActionMenuOpen(!isQuickActionMenuOpen)}
                    disabled={isStreaming}
                  >
                    <Plus className="h-4 w-4 text-gray-500" />
                  </Button>

                  <QuickActionMenu
                    isOpen={isQuickActionMenuOpen}
                    onClose={() => setIsQuickActionMenuOpen(false)}
                    onAction={handleQuickAction}
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full h-8 w-8 border-0 transition-all duration-200",
                    hasTyped ? "bg-gray-900 scale-110" : "bg-gray-200",
                  )}
                  disabled={!inputValue.trim() || isStreaming}
                >
                  <ArrowUp className={cn("h-4 w-4", hasTyped ? "text-white" : "text-gray-500")} />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modals and Panels */}
      <SlidePanel
        isOpen={isSlidePanelOpen}
        onClose={() => setIsSlidePanelOpen(false)}
        network={network}
        onNetworkChange={setNetwork}
      />

      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onNewSession={handleNewSession}
      />

      <TemplateMenu
        isOpen={isTemplateMenuOpen}
        onClose={() => setIsTemplateMenuOpen(false)}
        onSelectTemplate={(template) => {
          setInputValue(template)
          textareaRef.current?.focus()
        }}
      />

      <TransactionPreviewDrawer
        isOpen={!!previewDrawerData}
        onClose={() => setPreviewDrawerData(null)}
        data={previewDrawerData}
        onExecute={() => {
          navigator.vibrate?.(100)
          setPreviewDrawerData(null)
          alert("Transaction would be executed via Quack x402")
        }}
      />

      <CodeViewerModal
        isOpen={!!codeViewerData}
        onClose={() => setCodeViewerData(null)}
        code={codeViewerData}
        onAudit={() => {
          setCodeViewerData(null)
          setInputValue("Audit this contract")
          textareaRef.current?.focus()
        }}
      />
    </div>
  )
}
