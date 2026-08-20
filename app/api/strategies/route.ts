/**
 * Core public API contract stub — `/strategies`.
 * Implements `listStrategies` (GET) and `createStrategy` (POST).
 */
import { NextResponse } from 'next/server'
import {
  createStrategy,
  listStrategies,
} from '@/lib/server/strategy-store'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0)
  const rawSize = Number(searchParams.get('size') ?? '20') || 20
  const size = Math.min(100, Math.max(1, rawSize))

  await delay(350)
  return NextResponse.json(listStrategies(page, size))
}

export async function POST(request: Request) {
  let body: { name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (name.length < 1 || name.length > 200) {
    return NextResponse.json(
      { message: 'Name must be between 1 and 200 characters.' },
      { status: 400 },
    )
  }

  await delay(400)
  return NextResponse.json(createStrategy(name), { status: 201 })
}
