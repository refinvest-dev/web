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
