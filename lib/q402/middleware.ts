// IMPORTANT TODO:
// BIND THE PAYMENT TO THE EXACT INTENDED PAYLOAD BY HASHING
// VERIFY THE HASHES MATCH ON THE OTHER SIDE


import { NextRequest, NextResponse } from 'next/server'
import {
  NetworkConfigs,
  PaymentScheme,
  decodeBase64,
  verifyPayment,
  settlePayment,
  encodeBase64,
  NetworkConfig,
  SupportedNetworks,
  type SupportedNetwork,
} from '@q402/core'
import { createWalletClient, type WalletClient } from 'viem'
import { randomBytes } from 'crypto'

// Types
export interface Q402Config {
  network: SupportedNetwork
  recipientAddress: string
  implementationContract: string
  verifyingContract: string
  walletClient: WalletClient //ReturnType<typeof createWalletClient>
  endpoints: Array<{
    path: string
    token: string
    amount: string
  }>
  autoSettle?: boolean
  // When true the middleware will allow the payment `to` field to be any address
  // (useful for agent-generated transfers where the recipient varies).
  allowAnyRecipient?: boolean
}

export interface Q402PaymentInfo {
  verified: boolean
  payer: string
  amount?: string
  token?: string
}

const X_PAYMENT_HEADER = 'x-payment'
const X_PAYMENT_RESPONSE_HEADER = 'x-payment-response'

// Create 402 response
function create402Response(config: Q402Config, endpoint: Q402Config['endpoints'][0]) {
  const networkConfig = NetworkConfigs[config.network]

  const paymentId = '0x' + randomBytes(32).toString('hex');

  const paymentDetails = {
    scheme: PaymentScheme.EIP7702_DELEGATED,
    networkId: config.network,
    token: endpoint.token,
    amount: endpoint.amount,
    to: config.recipientAddress,
    implementationContract: config.implementationContract,
    witness: {
      domain: {
        name: 'q402',
        version: '1',
        chainId: networkConfig.chainId,
        verifyingContract: config.verifyingContract,
      },
      types: {
        Witness: [
          { name: 'owner', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'paymentId', type: 'bytes32' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      primaryType: 'Witness',
      message: {
        owner: '0x0000000000000000000000000000000000000000',
        token: endpoint.token,
        amount: endpoint.amount.toString(),
        to: config.recipientAddress,
        deadline: String(Math.floor(Date.now() / 1000) + 900),
        // paymentId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        paymentId,
        nonce: 0,
      },
    },
    authorization: {
      chainId: networkConfig.chainId,
      address: config.implementationContract,
      nonce: 0,
    },
  }

  // await storePaymentRequest(paymentId, { path: endpoint.path, amount: endpoint.amount, createdAt: Date.now() });

  return {
    x402Version: 1,
    accepts: [paymentDetails],
  }
}

// Main Next.js wrapper function
export function withQ402Payment(
  config: Q402Config,
  handler: (req: NextRequest, payment: Q402PaymentInfo) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      // Find matching endpoint
      const pathname = new URL(req.url).pathname
      const endpoint = config.endpoints.find((ep) => pathname === ep.path)

      // If endpoint not configured for payment, pass through
      if (!endpoint) {
        const mockPayment: Q402PaymentInfo = {
          verified: false,
          payer: '',
        }
        return handler(req, mockPayment)
      }

      // Check for payment header
      const paymentHeader = req.headers.get(X_PAYMENT_HEADER)

      if (!paymentHeader) {
        // Return 402 Payment Required
        const response = create402Response(config, endpoint)
        return NextResponse.json(response, { status: 402 })
      }

      // Decode payment
      let payload: any
      try {
        payload = decodeBase64(paymentHeader)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid payment header format' },
          { status: 400 }
        )
      }

      // Verify payment
      const verificationResult = await verifyPayment(payload)

      const tokenMismatch = endpoint.token !== 'any' && payload.paymentDetails.token !== endpoint.token;
      const amountMismatch = endpoint.amount !== 'any' && String(payload.paymentDetails.amount) !== String(endpoint.amount);
      const toMismatch = !config.allowAnyRecipient && payload.paymentDetails.to !== config.recipientAddress;

      if (tokenMismatch || amountMismatch || toMismatch) {
        return NextResponse.json({ error: 'Payment details do not match endpoint configuration' }, { status: 402 });
      }

      const deadline = Number(payload.paymentDetails.witness.message.deadline || 0);
      if (Date.now()/1000 > deadline) {
        return NextResponse.json({ error: 'Payment expired' }, { status: 402 });
      }
      // check if paymentId already used: if (await isPaymentIdUsed(paymentId)) reject

      if (!verificationResult.isValid) {
        return NextResponse.json(
          {
            x402Version: 1,
            accepts: [],
            error: `Payment verification failed: ${verificationResult.invalidReason}`,
          },
          { status: 402 }
        )
      }

      // Create payment info
      const paymentInfo: Q402PaymentInfo = {
        verified: true,
        payer: verificationResult.payer || "",
        amount: 'amount' in payload.paymentDetails ? payload.paymentDetails.amount : undefined,
        token: 'token' in payload.paymentDetails ? payload.paymentDetails.token : undefined,
      }

      // Auto-settle if enabled
      let settlementHeaders: Record<string, string> = {}

      if (config.autoSettle !== false) {
        try {
          // @ts-ignore
          const settlementResult = await settlePayment(config.walletClient, payload)

          if (settlementResult.success) {
            const executionResponse = {
              txHash: settlementResult.txHash,
              blockNumber: settlementResult.blockNumber,
              status: 'confirmed',
            }
            settlementHeaders[X_PAYMENT_RESPONSE_HEADER] = encodeBase64(executionResponse)
          } else {
            console.error('Settlement failed:', settlementResult.error)
          }
        } catch (error) {
          console.error('Settlement error:', error)
        }
      }

      // Call the actual handler
      const response = await handler(req, paymentInfo)

      // Add settlement headers if any
      if (Object.keys(settlementHeaders).length > 0) {
        const headers = new Headers(response.headers)
        Object.entries(settlementHeaders).forEach(([key, value]) => {
          headers.set(key, value)
        })
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      }

      return response
    } catch (error) {
      console.error('Q402 Middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}