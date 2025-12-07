import { NextRequest, NextResponse } from 'next/server';
import { chainGPTClient } from '@/lib/chaingpt/client';

export async function POST(req: NextRequest) {
  try {
    const { question, userId } = await req.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    
    const source = await chainGPTClient.auditContract(question, userId);
    
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
              // fallback
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
    
    // return NextResponse.json({
    //   success: true,
    //   data: response
    // });
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'Connection': 'keep-alive'
      }
    })
    
  } catch (error: any) {
    console.error('ChainGPT Chat Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}