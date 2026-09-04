import { NextResponse } from 'next/server'

/** Local development adapter for Core's CSRF-cookie issuance endpoint. */
export async function GET() {
  const response = new NextResponse(null, { status: 204 })
  response.cookies.set({
    name: 'XSRF-TOKEN',
    value: crypto.randomUUID(),
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  })
  return response
}
