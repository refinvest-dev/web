import { NextResponse } from 'next/server'
import { getAssetAvailability } from '@/entities/asset/api/server/asset-store'

/** Local adapter for Core's `GET /assets/{symbol}/availability` contract. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params
  const availability = getAssetAvailability(symbol)
  if (!availability) {
    return NextResponse.json({ message: 'Asset not found.' }, { status: 404 })
  }
  return NextResponse.json(availability)
}
