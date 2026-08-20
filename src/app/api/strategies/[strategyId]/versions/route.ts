/**
 * Core public API contract stub — `/strategies/{strategyId}/versions`.
 * Implements `defineStrategyVersion` (POST).
 */
import { NextResponse } from 'next/server'
import {
  createStrategyVersion,
  parseStrategyVersionInput,
} from '@/entities/strategy/api/server/strategy-store'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(
  request: Request,
  { params }: { params: Promise<{ strategyId: string }> },
) {
  let requestBody: unknown
  try {
    requestBody = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 })
  }

  const { body, violations } = parseStrategyVersionInput(requestBody)
  if (!body) {
    return NextResponse.json(
      {
        message: 'Strategy version is invalid.',
        violations,
      },
      { status: 400 },
    )
  }

  const { strategyId } = await params
  await delay(400)
  const version = createStrategyVersion(strategyId, body)
  if (!version) {
    return NextResponse.json(
      { message: 'Strategy not found.' },
      { status: 404 },
    )
  }

  return NextResponse.json(version, { status: 201 })
}
