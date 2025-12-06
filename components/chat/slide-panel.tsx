"use client"

import { useState } from "react"
import { X, Wallet, Shield, Clock, ChevronRight, ExternalLink, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Network, Wallet as WalletType, Policy, ActivityItem } from "@/lib/types"
import { walletsSimulation, defaultPolicySimulation, activityLogSimulation } from "@/data/simulation/wallet-data"

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  network: Network
  onNetworkChange: (network: Network) => void
  onScrollToActivity?: (activityId: string) => void
}

type PanelTab = "wallet" | "policies" | "activity"

export function SlidePanel({ isOpen, onClose, network, onNetworkChange, onScrollToActivity }: SlidePanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("wallet")
  const [wallets] = useState<WalletType[]>(walletsSimulation)
  const [policy] = useState<Policy>(defaultPolicySimulation)
  const [activities] = useState<ActivityItem[]>(activityLogSimulation)
  const [showNetworkConfirm, setShowNetworkConfirm] = useState(false)
  const [pendingNetwork, setPendingNetwork] = useState<Network | null>(null)

  const activeWallet = wallets.find((w) => w.isActive)

  const handleNetworkSwitch = (newNetwork: Network) => {
    if (newNetwork === "bnb-mainnet" && network === "bnb-testnet") {
      setPendingNetwork(newNetwork)
      setShowNetworkConfirm(true)
    } else {
      onNetworkChange(newNetwork)
    }
  }

  const confirmNetworkSwitch = () => {
    if (pendingNetwork) {
      onNetworkChange(pendingNetwork)
    }
    setShowNetworkConfirm(false)
    setPendingNetwork(null)
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900">Settings</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: "wallet" as PanelTab, icon: Wallet, label: "Wallet" },
            { id: "policies" as PanelTab, icon: Shield, label: "Policies" },
            { id: "activity" as PanelTab, icon: Clock, label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              {/* Active Wallet */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Active Wallet</h3>
                {activeWallet && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{activeWallet.name}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Connected</span>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">{truncateAddress(activeWallet.address)}</p>
                  </div>
                )}
              </div>

              {/* Switch Wallet */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Switch Wallet</h3>
                <div className="space-y-2">
                  {wallets
                    .filter((w) => !w.isActive)
                    .map((wallet) => (
                      <button
                        key={wallet.address}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{wallet.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{truncateAddress(wallet.address)}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Network Selector */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Network</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleNetworkSwitch("bnb-testnet")}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                      network === "bnb-testnet"
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-gray-50 hover:bg-gray-100",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">BNB</span>
                      </div>
                      <span className="font-medium text-gray-900">BNB Testnet</span>
                    </div>
                    {network === "bnb-testnet" && <Check className="h-4 w-4 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => handleNetworkSwitch("bnb-mainnet")}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                      network === "bnb-mainnet"
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-gray-50 hover:bg-gray-100",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">BNB</span>
                      </div>
                      <span className="font-medium text-gray-900">BNB Mainnet</span>
                    </div>
                    {network === "bnb-mainnet" && <Check className="h-4 w-4 text-amber-600" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === "policies" && (
            <div className="space-y-6">
              {/* Spend Caps */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Spend Caps</h3>
                <div className="space-y-3">
                  {policy.spendCaps.map((cap) => (
                    <div key={cap.token} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{cap.symbol}</span>
                        <span className="text-sm text-gray-500">
                          {cap.used} / {cap.limit}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${(cap.used / cap.limit) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{cap.remaining} remaining</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allow List */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Allow List</h3>
                <div className="space-y-2">
                  {policy.allowList.map((item) => (
                    <div key={item.address} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">{item.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deny List */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Deny List</h3>
                <div className="space-y-2">
                  {policy.denyList.map((item) => (
                    <div key={item.address} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">{item.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Name */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Active Policy: <span className="font-medium text-gray-900">{policy.name}</span>
                </p>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-2">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  onClick={() => onScrollToActivity?.(activity.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">{activity.title}</span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                  {activity.txHash && (
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          activity.status === "success"
                            ? "bg-green-100 text-green-700"
                            : activity.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {activity.status}
                      </span>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Network Switch Confirmation Modal */}
      {showNetworkConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Switch to Mainnet?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              You are about to switch to BNB Mainnet. Real funds will be used for transactions. Make sure you understand
              the risks before proceeding.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setShowNetworkConfirm(false)
                  setPendingNetwork(null)
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={confirmNetworkSwitch}>
                Switch to Mainnet
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
