// Types for the Quack × ChainGPT Agent interface

export type Network = "bnb-testnet" | "bnb-mainnet"
export type MessageCategory = "chat" | "audit" | "action" | "system" | "generate"
export type RiskLevel = "low" | "medium" | "high" | "critical"
export type Mode = "research" | "audit" | "action" | "generate"

export interface Wallet {
  address: string
  name: string
  isActive: boolean
}

export interface SpendCap {
  token: string
  symbol: string
  limit: number
  used: number
  remaining: number
}

export interface PolicyAddress {
  address: string
  label?: string
  type: "allow" | "deny"
}

export interface Policy {
  id: string
  name: string
  spendCaps: SpendCap[]
  allowList: PolicyAddress[]
  denyList: PolicyAddress[]
}

export interface ActivityItem {
  id: string
  type: "research" | "audit" | "action" | "transaction"
  title: string
  description: string
  timestamp: Date
  txHash?: string
  status?: "success" | "pending" | "failed"
}

// Research Response Types
export interface TokenHolder {
  address: string
  percentage: number
  tags: string[]
}

export interface TokenDetails {
  name: string
  symbol: string
  contractAddress: string
  marketCap?: string
  holderCount: number
  liquidity?: string
  verified: boolean
  topHolders: TokenHolder[]
}

export interface ResearchResponse {
  summary: string
  tokenDetails?: TokenDetails
}

// Audit Response Types
export interface AuditIssue {
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  lineNumber?: number
}

export interface AuditResponse {
  riskLevel: RiskLevel
  summary: string
  criticalIssues: AuditIssue[]
  warnings: AuditIssue[]
  infoNotes: AuditIssue[]
  contractCode?: string
}

// Action Response Types
export interface ActionPreview {
  type: "transfer" | "swap" | "deploy" | "call"
  title: string
  summary: string
  fromWallet: string
  toAddress?: string
  network: Network
  tokenAmount?: string
  tokenSymbol?: string
  spendCapUsage: {
    amount: number
    token: string
    remaining: number
    total: number
  }
  isAllowed: boolean
  isDenied: boolean
  gasEstimate: string
  gasSponsored: boolean
  policyName: string
  riskWarnings: string[]
  rawData?: string
  abiCall?: string
}

// Message Types
export interface ChatMessage {
  id: string
  type: "user" | "agent"
  category?: MessageCategory
  content: string
  timestamp: Date
  isStreaming?: boolean
  researchData?: ResearchResponse
  auditData?: AuditResponse
  actionData?: ActionPreview
  newSection?: boolean
}
