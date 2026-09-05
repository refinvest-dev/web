import { NextResponse } from 'next/server'

const providers = new Set(['kakao', 'naver', 'google'])

/**
 * Local development adapter for Core's OAuth authorization start endpoint.
 * Local fixtures do not authenticate; they only return to a validated Web path.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (!providers.has(provider)) {
    return NextResponse.json({ code: 'BAD_REQUEST', message: 'Unsupported provider.' }, { status: 400 })
  }

  const requestedReturnTo = new URL(request.url).searchParams.get('returnTo') ?? '/'
  const returnTo = requestedReturnTo.startsWith('/') &&
    !requestedReturnTo.startsWith('//') &&
    !requestedReturnTo.includes('\\')
    ? requestedReturnTo
    : '/'

  return NextResponse.redirect(new URL(returnTo, request.url))
}
