// Simulation data for Action flows
import type { ActionPreview } from "@/lib/types"

export const transferActionSimulation: ActionPreview = {
  type: "transfer",
  title: "Prepare Transfer Action",
  summary: "Transfer 10 USDT from Main Wallet to 0xabc...def on BNB Testnet",
  fromWallet: "0x742d...F8a3",
  toAddress: "0xabc...def",
  network: "bnb-testnet",
  tokenAmount: "10",
  tokenSymbol: "USDT",
  spendCapUsage: {
    amount: 10,
    token: "USDT",
    remaining: 90,
    total: 100,
  },
  isAllowed: true,
  isDenied: false,
  gasEstimate: "0.0005 BNB (~$0.15)",
  gasSponsored: true,
  policyName: "Default Policy",
  riskWarnings: [],
  rawData:
    "0xa9059cbb000000000000000000000000abc...def0000000000000000000000000000000000000000000000000000000009896800",
  abiCall: "transfer(address to, uint256 amount)",
}

export const swapActionSimulation: ActionPreview = {
  type: "swap",
  title: "Prepare Swap Action",
  summary: "Swap 0.5 BNB for approximately 150 USDT on PancakeSwap",
  fromWallet: "0x742d...F8a3",
  network: "bnb-testnet",
  tokenAmount: "0.5",
  tokenSymbol: "BNB",
  spendCapUsage: {
    amount: 0.5,
    token: "BNB",
    remaining: 4.5,
    total: 5,
  },
  isAllowed: true,
  isDenied: false,
  gasEstimate: "0.002 BNB (~$0.60)",
  gasSponsored: true,
  policyName: "Default Policy",
  riskWarnings: ["Slippage tolerance set to 0.5%", "Price impact: 0.02%"],
  rawData: "0x7ff36ab500000000000000000000000000000000000000000000000000000000...",
  abiCall: "swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline)",
}

export const deployActionSimulation: ActionPreview = {
  type: "deploy",
  title: "Prepare Deploy Action",
  summary: "Deploy ERC-20 Token Contract to BNB Testnet",
  fromWallet: "0x742d...F8a3",
  network: "bnb-testnet",
  spendCapUsage: {
    amount: 0.01,
    token: "BNB",
    remaining: 4.99,
    total: 5,
  },
  isAllowed: true,
  isDenied: false,
  gasEstimate: "0.01 BNB (~$3.00)",
  gasSponsored: false,
  policyName: "Default Policy",
  riskWarnings: ["Contract deployment requires gas payment", "Verify contract code before deploying to mainnet"],
  rawData: "0x608060405234801561001057600080fd5b506040518060400160405280600981526020...",
  abiCall: "constructor(string name, string symbol, uint256 initialSupply)",
}

export const deniedActionSimulation: ActionPreview = {
  type: "transfer",
  title: "Prepare Transfer Action",
  summary: "Transfer 500 USDT from Main Wallet to 0xHacker...666",
  fromWallet: "0x742d...F8a3",
  toAddress: "0xHacker...666",
  network: "bnb-testnet",
  tokenAmount: "500",
  tokenSymbol: "USDT",
  spendCapUsage: {
    amount: 500,
    token: "USDT",
    remaining: 0,
    total: 100,
  },
  isAllowed: false,
  isDenied: true,
  gasEstimate: "0.0005 BNB (~$0.15)",
  gasSponsored: true,
  policyName: "Default Policy",
  riskWarnings: [
    "BLOCKED: Recipient address is on your deny list",
    "BLOCKED: Transfer amount exceeds spend cap (100 USDT)",
  ],
}

export const actionThinkingSteps = [
  "Preparing transaction...",
  "Checking spend caps...",
  "Validating against policy...",
  "Estimating gas...",
  "Ready for review...",
]
