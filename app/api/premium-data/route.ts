import { Q402Config, withQ402Payment } from "@/lib/q402/middleware";
import { NextResponse } from "next/server";
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from 'viem/chains'

const recipientAddress = process.env.Q402_RECIPIENT_ADDRESS!;
if (!recipientAddress) throw new Error("Q402_RECIPIENT_ADDRESS required");

const implementationContract = process.env.Q402_IMPLEMENTATION_CONTRACT!;
if (!implementationContract) throw new Error("Q402_IMPLEMENTATION_CONTRACT required");

const verifyingContract = process.env.Q402_VERIFYING_CONTRACT!;
if (!verifyingContract) throw new Error("Q402_VERIFYING_CONTRACT required");

const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY!;
if (!sponsorPrivateKey) throw new Error("SPONSOR_PRIVATE_KEY required");

const account = privateKeyToAccount(sponsorPrivateKey as `0x${string}`);


const q402Config: Q402Config = {
    network: "bsc-testnet",
    recipientAddress: process.env.Q402_RECIPIENT_ADDRESS!,
    implementationContract: process.env.Q402_IMPLEMENTATION_CONTRACT!,
    verifyingContract: process.env.Q402_VERIFYING_CONTRACT!,
    walletClient: createWalletClient({
        account,
        chain: bscTestnet,
        transport: http(process.env.RPC_URL!)
    }),
    endpoints: [
        {
            path: '/api/premium-data',
            token: '0x0000000000000000000000000000000000000000', // Native BNB
            amount: '10000000000000000', // 0.01 BNB
        },
    ],
    autoSettle: true
}

export const POST = withQ402Payment(q402Config, async(req, payment) => {
    if (!payment.verified) {
        return NextResponse.json(
            { error: 'Payment required' },
            { status: 402 }
        )
    }

    const premiumData = {
        secret: 'This data costs 0.01BNB',
        paidBy: payment.payer,
        amount: payment.amount,
    }

    return NextResponse.json({
        success: true,
        data: premiumData,
    })
})