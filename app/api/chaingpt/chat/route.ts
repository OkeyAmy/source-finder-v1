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
    
    const source = await chainGPTClient.chat(question, userId);
    
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

// For streaming responses
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const question = searchParams.get('question');
  const userId = searchParams.get('userId');
  
  if (!question) {
    return NextResponse.json(
      { error: 'Question is required' },
      { status: 400 }
    );
  }
  
  const stream = await chainGPTClient.chat(question, userId || undefined);
  
  // Create a ReadableStream for SSE
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
      }
      controller.close();
    }
  });
  
  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}