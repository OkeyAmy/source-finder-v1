import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { keccak256, toUtf8Bytes } from "ethers";
import { BrowserProvider } from "ethers";
import { encodeFunctionData, WalletClient, Hex, createPublicClient, http } from "viem";
import { NetworkConfigs, PaymentImplementationAbi, PaymentItem, PaymentScheme, SettlementResult, SignedPaymentPayload, TransactionError } from "@q402/core";
import { privateKeyToAccount } from "viem/accounts";
// import { Hex } from "thirdweb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeResourceHash (obj: any) {
  const json = JSON.stringify(obj);
  return keccak256(toUtf8Bytes(json))
}

export async function requestExecution(txPayload: Record<string, any>) {
  // @ts-ignore
  if (!window.ethereum) {
    throw new Error('No Ethereum provider found. Please install a wallet like MetaMask.');
  }
  // 1) initial request - server will respond 402 with paymentDetails
  const res = await fetch('/api/execute-transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txPayload })
  });

  if (res.status === 402) {
    const body = await res.json(); // body.accepts[0] is paymentDetails
    const paymentDetails = body.accepts?.[0];

    // Wallet sign (ethers)
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // @ts-ignore
    const provider = new BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const { domain, types, message } = paymentDetails.witness;
    const signature = await signer.signTypedData(domain, types, message);

    // Build signed payload + txPayload and encode
    const signedPayload = { paymentDetails, signature, txPayload };
    const raw = JSON.stringify(signedPayload);
    const base64 = btoa(unescape(encodeURIComponent(raw))); // browser base64

    // 2) Resend with x-payment header
    const final = await fetch('/api/execute-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-payment': base64
      },
      body: JSON.stringify({ txPayload })
    });

    const result = await final.json();
    return result;
  } else {
    // If not 402, maybe the request was already authorized (rare)
    return res.json();
  }
}

/**
 * Stringify object with deterministic key ordering
 */
export function stableStringify(obj: any): string {
  const replacer = (_: string, value: any) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const ordered: Record<string, any> = {}
      Object.keys(value)
        .sort()
        .forEach((k) => {
          ordered[k] = value[k]
        })
      return ordered
    }
    return value
  }
  return JSON.stringify(obj, replacer)
}

/**
 * Hash canonical JSON string using keccak256
 */
export function payloadHash(canonicalJson: string): string {
  return keccak256(toUtf8Bytes(canonicalJson))
}

/**
 * Create hash of the transaction payload that both client and server can verify
 */
export function hashTransactionPayload(txPayload: any): string {
  const canonical = stableStringify(txPayload)
  return payloadHash(canonical)
}

type AccountType = ReturnType<typeof privateKeyToAccount>;

export async function settlePayment(
  walletClient: WalletClient,
  payload: SignedPaymentPayload,
  account: AccountType
): Promise<SettlementResult> {
  try {
    const { authorization, paymentDetails, witnessSignature } = payload;

    // Get network config
    const networkConfig = NetworkConfigs[paymentDetails.networkId];
    if (!networkConfig) {
      throw new TransactionError(`Unsupported network: ${paymentDetails.networkId}`);
    }

    // Determine if single or batch payment
    const isBatch = paymentDetails.scheme === PaymentScheme.EIP7702_DELEGATED_BATCH;

    // Encode function data
    let data: Hex;
    if (isBatch) {
      // Batch payment
      const batchDetails = payload.paymentDetails as any; // Type assertion for batch
      const items: PaymentItem[] = batchDetails.items || [];

      data = encodeFunctionData({
        abi: PaymentImplementationAbi,
        functionName: "payBatch",
        args: [
          authorization.address, // owner
          items.map((item) => ({
            token: item.token,
            amount: item.amount,
            to: item.to,
          })),
          BigInt(0), // deadline - from witness
          "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex, // paymentId
          witnessSignature,
        ],
      });
    } else {
      // Single payment
      data = encodeFunctionData({
        abi: PaymentImplementationAbi,
        functionName: "pay",
        args: [
          authorization.address, // owner
          paymentDetails.token,
          BigInt(paymentDetails.amount),
          paymentDetails.to,
          BigInt(0), // deadline - from witness
          "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex, // paymentId
          witnessSignature,
        ],
      });
    }

    // Prepare authorization list for type 0x04 transaction
    const authorizationList = [
      {
        chainId: Number(authorization.chainId),
        address: authorization.address,
        nonce: Number(authorization.nonce),
        yParity: authorization.yParity,
        r: authorization.r,
        s: authorization.s,
      },
    ];

    // Send type 0x04 transaction
    // Note: This requires viem experimental features for EIP-7702
    const hash = await walletClient.sendTransaction({
      to: authorization.address, // Send to owner's EOA
      data,
      // @ts-expect-error - authorizationList is experimental
      authorizationList,
      account,
    });

    // Wait for confirmation
    const publicClient = createPublicClient({
      chain: {
        id: networkConfig.chainId,
        name: networkConfig.name,
        rpcUrls: {
          default: { http: [networkConfig.rpcUrl] },
          public: { http: [networkConfig.rpcUrl] },
        },
        nativeCurrency: {
          name: "BNB",
          symbol: "BNB",
          decimals: 18,
        },
      },
      transport: http(networkConfig.rpcUrl),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      success: receipt.status === "success",
      txHash: hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}