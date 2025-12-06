// Simulation data for Wallet and Policy management
import type { Wallet, Policy, ActivityItem, SpendCap, PolicyAddress } from "@/lib/types"

export const walletsSimulation: Wallet[] = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f8F8a3",
    name: "Main Wallet",
    isActive: true,
  },
  {
    address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    name: "Trading Wallet",
    isActive: false,
  },
  {
    address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    name: "Cold Storage",
    isActive: false,
  },
]

export const defaultSpendCaps: SpendCap[] = [
  { token: "USDT", symbol: "USDT", limit: 100, used: 10, remaining: 90 },
  { token: "BNB", symbol: "BNB", limit: 5, used: 0.5, remaining: 4.5 },
  { token: "BUSD", symbol: "BUSD", limit: 200, used: 0, remaining: 200 },
  { token: "ETH", symbol: "ETH", limit: 1, used: 0, remaining: 1 },
]

export const allowListSimulation: PolicyAddress[] = [
  { address: "0xPancakeSwap...Router", label: "PancakeSwap Router", type: "allow" },
  { address: "0xBinance...HotWallet", label: "Binance Deposit", type: "allow" },
  { address: "0xMyFriend...Wallet", label: "Friend - Alice", type: "allow" },
]

export const denyListSimulation: PolicyAddress[] = [
  { address: "0xKnownScam...Address", label: "Known Scam", type: "deny" },
  { address: "0xHacker...666", label: "Flagged Address", type: "deny" },
  { address: "0xPhishing...Contract", label: "Phishing Contract", type: "deny" },
]

export const defaultPolicySimulation: Policy = {
  id: "default-policy",
  name: "Default Policy",
  spendCaps: defaultSpendCaps,
  allowList: allowListSimulation,
  denyList: denyListSimulation,
}

export const activityLogSimulation: ActivityItem[] = [
  {
    id: "act-1",
    type: "research",
    title: "Token Research: PEPE",
    description: "Analyzed PEPE token on BNB Chain",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "act-2",
    type: "audit",
    title: "Contract Audit",
    description: "Audited contract 0x25d8...bB00",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "act-3",
    type: "action",
    title: "Transfer Prepared",
    description: "10 USDT transfer to 0xabc...def",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "act-4",
    type: "transaction",
    title: "Transaction Executed",
    description: "Successfully transferred 10 USDT",
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    status: "success",
  },
  {
    id: "act-5",
    type: "transaction",
    title: "Swap Executed",
    description: "Swapped 0.1 BNB for 30 USDT",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    status: "success",
  },
]
