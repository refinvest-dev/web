import { NextResponse } from 'next/server'

/** Local development adapter for Core's logout endpoint. */
export function POST() {
  const response = new NextResponse(null, { status: 204 })
  response.cookies.delete('REFINVEST_ACCESS_TOKEN')
  response.cookies.delete('REFINVEST_REFRESH_TOKEN')
  return response
}
