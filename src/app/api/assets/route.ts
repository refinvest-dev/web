import { NextResponse } from 'next/server'
import { listAssets } from '@/entities/asset/api/server/asset-store'

/** Local adapter for Core's `GET /assets` public API contract. */
export function GET() {
  return NextResponse.json(listAssets())
}
