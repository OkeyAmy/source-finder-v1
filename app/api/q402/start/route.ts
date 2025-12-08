import { NextRequest, NextResponse } from 'next/server'

// Simple endpoint to receive the parsed q402 payload from the frontend.
// For now it validates shape shallowly and returns success. Integrate with
// your q402 flow (e.g. create 402 response, encode x-payment header or
// initiate settlement) as your next step.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Basic validation (shallow)
    const hasPaymentDetails = !!(body.paymentDetails || body.payment)

    if (!hasPaymentDetails) {
      return NextResponse.json({ error: 'Missing paymentDetails' }, { status: 400 })
    }

    // TODO: validate required fields, verify amounts/addresses, persist, etc.

    return NextResponse.json({ success: true, received: body }, { status: 200 })
  } catch (err: any) {
    console.error('q402 start error', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
