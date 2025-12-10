import { NextRequest, NextResponse } from 'next/server';
import { chainGPTClient } from '@/lib/chaingpt/client';
import { randomBytes } from 'crypto';

/**
 * This route supports two modes:
 * - default: uses the smart contract generator stream (existing behavior)
 * - payload: instructs the model to return a single marker-wrapped JSON object
 *            that represents a q402 payment payload. The JSON MUST be wrapped
 *            between `[Q402-PAYLOAD]` and `[/Q402-PAYLOAD]` with no other text.
 */
export async function POST(req: NextRequest) {
  try {
    const { question, userId, mode, network } = await req.json();

    const implementationContract = process.env.Q402_IMPLEMENTATION_CONTRACT || "";
    const verifyingContract = process.env.Q402_VERIFYING_CONTRACT || "";
    const paymentId = '0x' + randomBytes(32).toString('hex');

    const deadline = Date.now()/1000 + 900;

    if (implementationContract === "") {
      return NextResponse.json(
        { error: "Q402_IMPLEMENTATION_CONTRACT required" },
        { status: 400 }
      );
    }

    if (verifyingContract === "") {
      return NextResponse.json(
        { error: "Q402_VERIFYING_CONTRACT required" },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    let source: AsyncIterable<any>;

    if (mode === 'payload') {
      // Augment the user's instruction into a strict payload-only prompt.
      // For now we handle transfer and swap scenarios.
      const lower = String(question).toLowerCase();

      // helper to produce the base wrapper instructions
      const wrapper = `You must output ONLY a single JSON object representing a q402 payment payload.\n` +
        `Wrap the JSON exactly between the markers (no surrounding text):\n[Q402-PAYLOAD]\n<JSON_OBJECT>\n[/Q402-PAYLOAD]\n` +
        `The JSON must be valid and parseable by JSON.parse(). Do NOT include any code fences, explanations, or extra text.\n` +
        `Use the provided paymentId and deadline exactly as given. Amounts must be strings in wei. Addresses and hex values must be 0x-prefixed strings.\n`;

      // Provide a strict JSON skeleton that the model MUST fill in verbatim
      const jsonSkeleton = {
        paymentDetails: {
          scheme: "EIP7702_DELEGATED",
          networkId: "<networkId or network key>",
          token: "<token address or 'native'>",
          amount: "<amount in wei as string>",
          to: "<0xrecipient>",
          implementationContract: implementationContract,
          witness: {
            domain: {
              name: "q402",
              version: "1",
              chainId: "<number>",
              verifyingContract: verifyingContract
            },
            types: {
              Witness: [
                { name: "owner", type: "address" },
                { name: "token", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "to", type: "address" },
                { name: "deadline", type: "uint256" },
                { name: "paymentId", type: "bytes32" },
                { name: "nonce", type: "uint256" }
              ]
            },
            primaryType: "Witness",
            message: {
              owner: "0x0000000000000000000000000000000000000000",
              token: "<token>",
              amount: "<amount in wei as string>",
              to: "<0xrecipient>",
              // deadline should be a number (unix seconds) when filled in by the model
              deadline: deadline,
              // Use the server-generated paymentId value
              paymentId: paymentId,
              nonce: 0
            }
          },
          authorization: {
            chainId: "<number>",
            address: implementationContract,
            nonce: 0
            // Signature fields (yParity, r, s) are optional for development.
            // Client will add them after wallet signing before sending.
          }
        }
      }

      let actionSpecific = '';
      if (lower.includes('swap')) {
        actionSpecific = `The user requests a token swap. Produce a q402 payment payload where paymentDetails describe the swap action (token addresses, amount in wei, recipient etc.) matching the user's instruction.`
      } else if (lower.includes('transfer')) {
        actionSpecific = `The user requests a native transfer. Produce a q402 payment payload where paymentDetails.token is the native token address (or another if provided), amount is in wei as a string, and to is the target address.`
      } else {
        actionSpecific = `The user requests an on-chain action. Produce a q402 payment payload that best represents the requested action.`
      }

      const prompt = `${wrapper}\n${actionSpecific}\n\n` +
        `Inputs (do not include these labels in the output):\n` +
        `- userInstruction: "${question.replace(/\n/g,' ')}"\n` +
        `- paymentId: "${paymentId}"\n` +
        `- network: "${network || ''}"\n` +
        `- implementationContract: "${implementationContract || ''}"\n` +
        `- verifyingContract: "${verifyingContract || ''}"\n\n` +
        `Required JSON skeleton (REPLACE the placeholder values; keep structure EXACTLY):\n` +
        `[Q402-PAYLOAD]\n` +
        `${JSON.stringify(jsonSkeleton, null, 2)}\n` +
        `[/Q402-PAYLOAD]\n` +
        `IMPORTANT: Output ONLY the above marker-wrapped JSON object. Do NOT add any text outside the markers. The JSON must be valid and include all fields in the skeleton. Use the provided paymentId value exactly.\n\n` +
        `Type requirements (MUST follow):\n` +
        `- witness.domain.chainId: number (no quotes)\n` +
        `- witness.message.deadline: number (unix seconds, no quotes)\n` +
        `- authorization.chainId: number (no quotes)\n` +
        `- All amounts: strings containing integer wei amounts (e.g., \"1000000000000000000\")\n` +
        `- Addresses and hex values must be 0x-prefixed strings\n` +
        `- paymentId must match the provided paymentId exactly\n` +
        `If any field cannot be determined, fill with a reasonable placeholder but do not remove fields or change keys.`

      source = await chainGPTClient.chat(prompt, userId)
    } else {
      // default behavior (keep existing generator behavior)
      source = await chainGPTClient.generateContract(question, userId);
    }

    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of source) {
            let text: string;
            if (typeof chunk === "string") {
              text = chunk;
            } else if (chunk?.data) {
              // decode "Buffer-like" object
              text = new TextDecoder().decode(new Uint8Array(chunk.data));
            } else {
              text = String(chunk);
            }

            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch(err) {
          controller.error(err);
        }
      },
    })

    // return new NextResponse(body, {
    //   status: 200,
    //   headers: {
    //     'Content-Type': 'text/plain; charset=utf-8',
    //     'Cache-Control': 'no-store',
    //     'Connection': 'keep-alive'
    //   }
    // })

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      }
    });


  } catch (error: any) {
    console.error('ChainGPT Generate Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}