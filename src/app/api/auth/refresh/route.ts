import { NextResponse } from 'next/server'

/** Local development adapter for Core's refresh-token rotation endpoint. */
export function POST() {
  return new NextResponse(null, { status: 204 })
}
