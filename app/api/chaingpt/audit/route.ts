import { NextRequest, NextResponse } from 'next/server';
import { chainGPTClient } from '@/lib/chaingpt/client';

export async function POST(req: NextRequest) {
  try {
    const { question, userId } = await req.json();
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (question.length > 10000) {
      return NextResponse.json(
        { error: 'Question exceeds maximum length of 10,000 characters' },
        { status: 400 }
      );
    }
    
    const source = await chainGPTClient.auditContract(question, userId);
    
    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of source) {
            let text: string = '';

            if (typeof chunk === 'string') {
              text = chunk;
            } else if (chunk instanceof Uint8Array) {
              text = new TextDecoder().decode(chunk);
            } else if (chunk instanceof ArrayBuffer) {
              text = new TextDecoder().decode(new Uint8Array(chunk));
            } else if (chunk && typeof chunk === 'object') {
              if ('data' in chunk) {
                const d: any = (chunk as any).data;
                if (d instanceof Uint8Array) {
                  text = new TextDecoder().decode(d);
                } else if (ArrayBuffer.isView(d)) {
                  text = new TextDecoder().decode(new Uint8Array((d as any).buffer, (d as any).byteOffset || 0, (d as any).byteLength || (d as any).length));
                } else if (Array.isArray(d)) {
                  text = new TextDecoder().decode(new Uint8Array(d));
                } else if (typeof d === 'string') {
                  text = d;
                } else {
                  try { text = JSON.stringify(chunk); } catch (e) { text = String(chunk); }
                }
              } else if ('text' in chunk && typeof (chunk as any).text === 'string') {
                text = (chunk as any).text;
              } else {
                try { text = JSON.stringify(chunk); } catch (e) { text = String(chunk); }
              }
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
    console.error('ChainGPT Audit Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}