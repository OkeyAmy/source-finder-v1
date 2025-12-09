import { Q402Config, withQ402Payment } from "@/lib/q402/middleware";
import { hashTransactionPayload } from "@/lib/utils";
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

const sponsorPrivateKeyRaw = process.env.SPONSOR_PRIVATE_KEY;
if (!sponsorPrivateKeyRaw) throw new Error("SPONSOR_PRIVATE_KEY required");

// Normalize: ensure 0x prefix
const sponsorPrivateKey = sponsorPrivateKeyRaw.startsWith('0x') ? sponsorPrivateKeyRaw : `0x${sponsorPrivateKeyRaw}`;

// Validate length/format: must be a 32-byte hex string (0x + 64 hex chars)
if (!/^0x[0-9a-fA-F]{64}$/.test(sponsorPrivateKey)) {
    throw new Error("SPONSOR_PRIVATE_KEY must be a 32-byte hex string (0x followed by 64 hex characters)");
}

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
            path: '/api/execute-transfer',
            token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native BNB
            // Accept any amount produced by an AI-generated payload; middleware will
            // skip amount strictness when set to 'any'. Use caution: accepting any
            // amount means the client/model must be trusted to not request excessive amounts.
            amount: 'any',
        },
    ],
    autoSettle: true,
    // Allow the recipient address in the AI-generated payload to be variable
    // (useful for user-directed transfers to arbitrary addresses)
    allowAnyRecipient: true,
}

export const POST = withQ402Payment(q402Config, async(req, payment) => {
    
    const body = await req.json();
    const txPayload = body.txPayload;

    console.log("Payment: ", payment);
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
        message: 'Execution accepted - facilitator will submit or has submitted tx'
    }

    console.log(premiumData);

    return NextResponse.json({
        success: true,
        data: premiumData,
    })
})