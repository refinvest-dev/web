import { NextResponse } from 'next/server'
import { getUsage } from '@/entities/account/api/server/usage-store'

/** Local adapter for Core's `GET /me/usage` public API contract. */
export function GET() {
  return NextResponse.json(getUsage())
}
