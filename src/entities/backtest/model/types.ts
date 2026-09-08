/**
 * Backtest API-boundary types. Shapes mirror the Core public API and its
 * referenced Compute value objects in `context/openapi`.
 */

export interface BacktestPeriod {
  start: string
  end: string
}

/** Decimal ratios: `0.001` represents 0.1%. */
export interface FeeModel {
  commission: number
  slippage: number
}

export type BacktestRunStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'

export interface RunBacktestRequest {
  period: BacktestPeriod
  feeModel: FeeModel
}

export interface BacktestRunSummary {
  id: string
  strategyId: string
  strategyVersionId: string
  status: BacktestRunStatus
  requestedPeriod: BacktestPeriod
  feeModel: FeeModel
  createdAt: string
}

export interface BacktestRunDetail extends BacktestRunSummary {
  actualPeriod?: BacktestPeriod | null
  datasetSnapshotId?: string | null
  engineVersion?: string | null
  /** Compute-owned `BacktestResult`; available only when status is COMPLETED. */
  result?: BacktestResult | null
  failureReason?: string | null
  /** Available only when status is FAILED. */
  errorCode?: FatalErrorCode | null
}

export type FatalErrorCode =
  | 'MISSING_REQUIRED_DATA'
  | 'DATASET_CORRUPTION'
  | 'CALENDAR_RESOLUTION_FAILED'
  | 'PRICE_DATA_MISSING'
  | 'EXECUTION_TIMEOUT'
  | 'DSL_INVALID'

export interface BacktestMetrics {
  totalReturn?: number | null
  cagr?: number | null
  mdd?: number | null
  sharpe?: number | null
  winRate?: number | null
  tradeCount?: number
  avgTradeReturn?: number | null
  avgHoldingPeriod?: number | null
  profitFactor?: number | null
}

export interface EquityCurvePoint {
  date: string
  value: number
}

export interface BacktestTrade {
  signalTime: string
  entryTime: string
  entryPrice: number
  exitTime: string
  exitPrice: number
  returnPct: number
  holdingPeriod: number
}

export interface BuyAndHoldResult {
  asset: string
  equityCurve: EquityCurvePoint[]
  totalReturn: number
  cagr: number | null
  mdd: number
}

export type SignalExecutionMarketRelation = 'SAME_MARKET' | 'CROSS_MARKET'

export interface SignalExecutionDelay {
  median: number
  max: number
  distribution: number[]
}

export interface DataIntegrityStatus {
  datasetSnapshotId: string
  corporateActionsApplied: boolean
  pointInTimeValidationPassed: boolean
}

export interface BacktestResult {
  backtestRunId: string
  metrics: BacktestMetrics
  equityCurve: EquityCurvePoint[]
  trades: BacktestTrade[]
  benchmark: {
    primary: BuyAndHoldResult
    secondaryReference?: BuyAndHoldResult | null
  }
  signalExecutionMarketRelation: SignalExecutionMarketRelation
  signalExecutionDelay: SignalExecutionDelay
  sampleSizeWarning: 'NONE' | 'LOW' | 'ZERO'
  dataIntegrityStatus: DataIntegrityStatus
}
