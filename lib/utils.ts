import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { keccak256, toUtf8Bytes } from "ethers";
import { BrowserProvider } from "ethers";

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