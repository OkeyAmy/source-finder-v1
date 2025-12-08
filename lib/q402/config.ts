/**
 * Shared configuration for server examples
 */

import type { Address } from "viem";
import { SupportedNetworks } from "@q402/core";

export interface ServerConfig {
  network: typeof SupportedNetworks.BSC_TESTNET | typeof SupportedNetworks.BSC_MAINNET;
  recipientAddress: Address;
  implementationContract: Address;
  verifyingContract: Address;
  sponsorPrivateKey: `0x${string}`;
  rpcUrl: string;
  port: number;
}

/**
 * Load configuration from environment variables
 */
export function loadServerConfig(): ServerConfig {
  const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY as `0x${string}`;
  const recipientAddress = process.env.RECIPIENT_ADDRESS as Address;
  const implementationContract = process.env.IMPLEMENTATION_CONTRACT as Address;
  const verifyingContract = process.env.VERIFYING_CONTRACT as Address;

  if (!sponsorPrivateKey) {
    throw new Error("SPONSOR_PRIVATE_KEY environment variable is required");
  }

  if (!recipientAddress) {
    throw new Error("RECIPIENT_ADDRESS environment variable is required");
  }

  if (!implementationContract) {
    throw new Error("IMPLEMENTATION_CONTRACT environment variable is required");
  }

  if (!verifyingContract) {
    throw new Error("VERIFYING_CONTRACT environment variable is required");
  }

  return {
    network: SupportedNetworks.BSC_TESTNET,
    recipientAddress,
    implementationContract,
    verifyingContract,
    sponsorPrivateKey,
    rpcUrl: process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
    port: parseInt(process.env.PORT || "3000", 10),
  };
}

/**
 * Common token addresses on BSC testnet
 */
export const TEST_TOKENS = {
  USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd" as Address,
  USDC: "0x64544969ed7EBf5f083679233325356EbE738930" as Address,
};
