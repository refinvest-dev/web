import type { DefineStrategyVersionRequest } from '../../model/types'

/**
 * In-memory stub of the Core public API's Strategy domain.
 *
 * This faithfully implements the shapes and rules from the `core-api` OpenAPI
 * contract (StrategySummary / StrategyDetail / StrategyVersion, pagination,
 * CreateStrategy validation) so the web app has a working backend during
 * local/preview development. It invents no fields beyond the contract.
 *
 * To run against the real Core API instead, set `NEXT_PUBLIC_API_BASE_URL`
 * to its origin — no frontend changes required.
 */

interface StoredVersion {
  id: string
  strategyId: string
  createdAt: string
  primarySignalAsset: string
  conditions: unknown[]
  executionAsset: string
  lag: number
  exit: { holdingSignalSessions: number }
}

interface StoredStrategy {
  id: string
  name: string
  createdAt: string
  versions: StoredVersion[]
}

interface StrategyStore {
  strategies: StoredStrategy[]
}

// Persist across dev-server HMR reloads.
const globalForStore = globalThis as unknown as {
  __refinvestStrategyStore?: StrategyStore
}

function seed(): StrategyStore {
  const now = Date.now()
  const iso = (offsetDays: number) =>
    new Date(now - offsetDays * 86_400_000).toISOString()
  const additionalStrategies = [
    ['AAPL Mean Reversion', 'AAPL'],
    ['SPY Opening Range', 'SPY'],
    ['IWM Trend Breakout', 'IWM'],
    ['NVDA Earnings Drift', 'NVDA'],
    ['TLT Duration Rotation', 'TLT'],
    ['GLD Risk Hedge', 'GLD'],
    ['MSFT Quality Momentum', 'MSFT'],
    ['AMZN Volume Expansion', 'AMZN'],
    ['META Relative Strength', 'META'],
    ['XLE Sector Rotation', 'XLE'],
    ['SMH Trend Following', 'SMH'],
    ['DIA Defensive Allocation', 'DIA'],
    ['GOOGL Gap Continuation', 'GOOGL'],
    ['XLF Financials Breadth', 'XLF'],
    ['EEM Emerging Markets Trend', 'EEM'],
    ['ARKK Volatility Breakout', 'ARKK'],
    ['AMD Pullback Entry', 'AMD'],
    ['XLV Healthcare Momentum', 'XLV'],
    ['COIN Crypto Equity Filter', 'COIN'],
    ['USO Oil Trend Reversal', 'USO'],
    ['TSLA Range Expansion', 'TSLA'],
  ] as const

  return {
    strategies: [
      {
        id: 'str_9f2a1c',
        name: 'QQQ Momentum Regime',
        createdAt: iso(21),
        versions: [
          {
            id: 'sv_4b7d20',
            strategyId: 'str_9f2a1c',
            createdAt: iso(20),
            primarySignalAsset: 'QQQ',
            conditions: [{ kind: 'sma-cross' }, { kind: 'rsi-threshold' }],
            executionAsset: 'QQQ',
            lag: 1,
            exit: { holdingSignalSessions: 5 },
          },
        ],
      },
      {
        id: 'str_3e88b4',
        name: 'BTC Volatility Filter',
        createdAt: iso(9),
        versions: [
          {
            id: 'sv_c19f83',
            strategyId: 'str_3e88b4',
            createdAt: iso(8),
            primarySignalAsset: 'BTCUSDT',
            conditions: [{ kind: 'atr-band' }],
            executionAsset: 'BTCUSDT',
            lag: 0,
            exit: { holdingSignalSessions: 3 },
          },
        ],
      },
      {
        id: 'str_1d0af7',
        name: 'Overnight Drift (draft)',
        createdAt: iso(2),
        versions: [],
      },
      ...additionalStrategies.map(([name, asset], index) => {
        const id = `str_seed_${String(index + 1).padStart(2, '0')}`
        const createdAtOffset = index + 3
        const isDraft = index % 4 === 0

        return {
          id,
          name,
          createdAt: iso(createdAtOffset),
          versions: isDraft
            ? []
            : [
                {
                  id: `sv_seed_${String(index + 1).padStart(2, '0')}`,
                  strategyId: id,
                  createdAt: iso(createdAtOffset - 1),
                  primarySignalAsset: asset,
                  conditions: [{ kind: 'mock-signal' }],
                  executionAsset: asset,
                  lag: index % 2,
                  exit: { holdingSignalSessions: 3 + (index % 5) },
                },
              ],
        }
      }),
    ],
  }
}

function store(): StrategyStore {
  if (!globalForStore.__refinvestStrategyStore) {
    globalForStore.__refinvestStrategyStore = seed()
  }
  return globalForStore.__refinvestStrategyStore
}

function latestVersionId(s: StoredStrategy): string | null {
  return s.versions.length ? s.versions[s.versions.length - 1].id : null
}

function toSummary(s: StoredStrategy) {
  return {
    id: s.id,
    name: s.name,
    createdAt: s.createdAt,
    latestVersionId: latestVersionId(s),
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2, 8)}`
}

export interface ListResult {
  items: ReturnType<typeof toSummary>[]
  page: number
  size: number
  total: number
}

export function listStrategies(page: number, size: number): ListResult {
  const all = [...store().strategies].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
  const start = page * size
  return {
    items: all.slice(start, start + size).map(toSummary),
    page,
    size,
    total: all.length,
  }
}

export function getStrategy(strategyId: string) {
  const s = store().strategies.find((x) => x.id === strategyId)
  if (!s) return null
  return { ...toSummary(s), versions: s.versions }
}

export function createStrategy(name: string) {
  const strategy: StoredStrategy = {
    id: generateId('str'),
    name,
    createdAt: new Date().toISOString(),
    versions: [],
  }
  store().strategies.push(strategy)
  return toSummary(strategy)
}

/** Finds the owning Strategy without exposing the in-memory store itself. */
export function findStrategyIdByVersion(versionId: string): string | null {
  return (
    store().strategies.find((strategy) =>
      strategy.versions.some((version) => version.id === versionId),
    )?.id ?? null
  )
}

export interface StrategyVersionInputResult {
  body?: DefineStrategyVersionRequest
  violations: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Parses only the structural invariants owned by the Core public API. */
export function parseStrategyVersionInput(
  value: unknown,
): StrategyVersionInputResult {
  const violations: string[] = []
  if (!isRecord(value)) {
    return { violations: ['Request body must be a JSON object.'] }
  }

  const primarySignalAsset =
    typeof value.primarySignalAsset === 'string'
      ? value.primarySignalAsset.trim()
      : ''
  const executionAsset =
    typeof value.executionAsset === 'string' ? value.executionAsset.trim() : ''
  const conditions = Array.isArray(value.conditions) ? value.conditions : undefined
  const lag = value.lag
  const exit = isRecord(value.exit) ? value.exit : undefined
  const holdingSignalSessions = exit?.holdingSignalSessions
  const validLag =
    typeof lag === 'number' && Number.isInteger(lag) && lag >= 0
      ? lag
      : undefined
  const validHoldingSignalSessions =
    typeof holdingSignalSessions === 'number' &&
    Number.isInteger(holdingSignalSessions) &&
    holdingSignalSessions >= 1
      ? holdingSignalSessions
      : undefined

  if (!primarySignalAsset) {
    violations.push('Primary signal asset is required.')
  }
  if (!executionAsset) {
    violations.push('Execution asset is required.')
  } else if (executionAsset === 'VIX') {
    violations.push('VIX cannot be used as an execution asset.')
  }
  if (!conditions || conditions.length === 0) {
    violations.push('At least one condition is required.')
  }
  if (validLag === undefined) {
    violations.push('Lag must be a whole number of zero or more sessions.')
  }
  if (validHoldingSignalSessions === undefined) {
    violations.push('Holding period must be at least one signal session.')
  }

  if (
    violations.length > 0 ||
    !conditions ||
    validLag === undefined ||
    validHoldingSignalSessions === undefined
  ) {
    return { violations }
  }

  return {
    violations,
    body: {
      primarySignalAsset,
      conditions,
      executionAsset,
      lag: validLag,
      exit: { holdingSignalSessions: validHoldingSignalSessions },
    },
  }
}

export function createStrategyVersion(
  strategyId: string,
  body: DefineStrategyVersionRequest,
) {
  const strategy = store().strategies.find((item) => item.id === strategyId)
  if (!strategy) return null

  const version: StoredVersion = {
    id: generateId('sv'),
    strategyId,
    createdAt: new Date().toISOString(),
    ...body,
  }
  strategy.versions.push(version)
  return version
}
