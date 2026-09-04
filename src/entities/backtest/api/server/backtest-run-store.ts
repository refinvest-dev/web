import type {
  BacktestRunDetail,
  BacktestPeriod,
  BacktestRunSummary,
  FeeModel,
} from '../../model/types'

interface BacktestRunStore {
  runs: BacktestRunSummary[]
}

const globalForStore = globalThis as unknown as {
  __refinvestBacktestRunStore?: BacktestRunStore
}

function store(): BacktestRunStore {
  if (!globalForStore.__refinvestBacktestRunStore) {
    globalForStore.__refinvestBacktestRunStore = { runs: [] }
  }
  return globalForStore.__refinvestBacktestRunStore
}

function generateId() {
  return `btr_${Math.random().toString(16).slice(2, 10)}`
}

/**
 * Local development adapter for the Core API. It records only the accepted
 * request and deliberately keeps its status PENDING: Compute-owned execution
 * and result semantics are not available in this repository.
 */
export function createPendingBacktestRun({
  strategyId,
  strategyVersionId,
  period,
  feeModel,
}: {
  strategyId: string
  strategyVersionId: string
  period: BacktestPeriod
  feeModel: FeeModel
}): BacktestRunSummary {
  const run: BacktestRunSummary = {
    id: generateId(),
    strategyId,
    strategyVersionId,
    status: 'PENDING',
    requestedPeriod: period,
    feeModel,
    createdAt: new Date().toISOString(),
  }
  store().runs.push(run)
  return run
}

export function getBacktestRun(runId: string): BacktestRunDetail | null {
  return store().runs.find((run) => run.id === runId) ?? null
}

export function listBacktestRuns(strategyId: string, page: number, size: number) {
  const all = store().runs
    .filter((run) => run.strategyId === strategyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const start = page * size
  return {
    items: all.slice(start, start + size),
    page,
    size,
    total: all.length,
  }
}
