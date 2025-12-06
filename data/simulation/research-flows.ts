// Simulation data for Research flows
import type { ResearchResponse } from "@/lib/types"

export const tokenResearchSimulation: ResearchResponse = {
  summary:
    "PEPE is a meme token on the BNB Chain that gained significant traction in Q2 2024. The token follows the ERC-20 standard with standard transfer functions. The contract is verified and shows no obvious malicious functions, though the high concentration among top holders presents some centralization risk.",
  tokenDetails: {
    name: "Pepe Token",
    symbol: "PEPE",
    contractAddress: "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
    marketCap: "$1.2B",
    holderCount: 245892,
    liquidity: "$45.2M",
    verified: true,
    topHolders: [
      {
        address: "0x1234...abcd",
        percentage: 12.5,
        tags: ["Exchange Hot Wallet", "Binance"],
      },
      {
        address: "0x5678...efgh",
        percentage: 8.3,
        tags: ["Team Wallet"],
      },
      {
        address: "0x9abc...ijkl",
        percentage: 5.2,
        tags: ["Contract", "Liquidity Pool"],
      },
      {
        address: "0xdef0...mnop",
        percentage: 3.1,
        tags: ["Whale"],
      },
      {
        address: "0x1111...qrst",
        percentage: 2.8,
        tags: ["Exchange Hot Wallet", "OKX"],
      },
    ],
  },
}

export const contractResearchSimulation: ResearchResponse = {
  summary:
    "This is a standard ERC-20 token contract with additional staking functionality. The contract includes a timelock mechanism for admin functions and has been deployed for 8 months without any reported incidents.",
  tokenDetails: {
    name: "Staked BNB",
    symbol: "sBNB",
    contractAddress: "0x7890...wxyz",
    marketCap: "$500M",
    holderCount: 89234,
    liquidity: "$120M",
    verified: true,
    topHolders: [
      {
        address: "0xaaaa...1111",
        percentage: 25.0,
        tags: ["Contract", "Staking Pool"],
      },
      {
        address: "0xbbbb...2222",
        percentage: 15.0,
        tags: ["Treasury"],
      },
      {
        address: "0xcccc...3333",
        percentage: 8.5,
        tags: ["Exchange Hot Wallet"],
      },
    ],
  },
}

export const researchThinkingSteps = [
  "Querying ChainGPT for token data...",
  "Fetching on-chain metrics...",
  "Analyzing holder distribution...",
  "Checking verification status...",
  "Compiling research report...",
]
