import type {
  AssetSymbol,
  ComparisonOperator,
  DefineStrategyVersionRequest,
  LogicalCombinator,
  MetricReference,
  MetricType,
  StrategyCondition,
} from '@/entities/strategy/model/types'

export type BuilderLevel = 1 | 2 | 3
export type OperandBKind = 'LITERAL' | 'METRIC_REFERENCE'

export interface MetricReferenceFormValue {
  asset: string
  metric: MetricType
  window: string
}

export interface ConditionFormValue {
  operandA: MetricReferenceFormValue
  operator: ComparisonOperator
  operandBKind: OperandBKind
  literalValue: string
  operandBMetric: MetricReferenceFormValue
}

export interface StrategyVersionFormValue {
  level: BuilderLevel
  primarySignalAsset: string
  executionAsset: string
  conditions: ConditionFormValue[]
  logicalCombinator: LogicalCombinator
  lag: string
  holdingSignalSessions: string
}

export interface StrategyVersionFormErrors {
  primarySignalAsset?: string
  executionAsset?: string
  conditions?: string
  lag?: string
  holdingSignalSessions?: string
}

export type BuildStrategyVersionResult =
  | { ok: true; payload: DefineStrategyVersionRequest; errors: StrategyVersionFormErrors }
  | { ok: false; errors: StrategyVersionFormErrors }

const ASSET_SYMBOLS: readonly AssetSymbol[] = [
  'QQQ',
  'SPY',
  'TQQQ',
  'SOXL',
  'BTCUSDT',
]

export function isAssetSymbol(value: string): value is AssetSymbol {
  return ASSET_SYMBOLS.some((symbol) => symbol === value)
}

export function isMetricReference(
  value: number | MetricReference,
): value is MetricReference {
  return typeof value !== 'number'
}

export function createEmptyCondition(): ConditionFormValue {
  return {
    operandA: { asset: '', metric: 'SIMPLE', window: '1' },
    operator: 'GT',
    operandBKind: 'LITERAL',
    literalValue: '',
    operandBMetric: { asset: '', metric: 'SIMPLE', window: '1' },
  }
}

export function createInitialStrategyVersionForm(): StrategyVersionFormValue {
  return {
    level: 1,
    primarySignalAsset: '',
    executionAsset: '',
    conditions: [createEmptyCondition()],
    logicalCombinator: 'AND',
    lag: '0',
    holdingSignalSessions: '1',
  }
}

function buildMetricReference(
  value: MetricReferenceFormValue,
  label: string,
): { value?: MetricReference; error?: string } {
  if (!isAssetSymbol(value.asset)) {
    return { error: `${label}: choose a supported asset.` }
  }

  if (value.metric === 'SIMPLE') {
    return {
      value: { asset: value.asset, metric: value.metric, window: null },
    }
  }

  const window = Number(value.window)
  if (!Number.isInteger(window) || window < 1) {
    return {
      error: `${label}: RETURN and CHANGE require a whole-number window of at least 1.`,
    }
  }

  return { value: { asset: value.asset, metric: value.metric, window } }
}

function buildCondition(
  condition: ConditionFormValue,
  index: number,
  logicalCombinator: LogicalCombinator,
): { value?: StrategyCondition; error?: string } {
  const label = `Condition ${index + 1}`
  const operandA = buildMetricReference(condition.operandA, `${label} left metric`)
  if (!operandA.value) return { error: operandA.error }

  let operandB: number | MetricReference
  if (condition.operandBKind === 'LITERAL') {
    const literal = condition.literalValue.trim()
    const parsed = Number(literal)
    if (literal === '' || !Number.isFinite(parsed)) {
      return { error: `${label}: enter a finite numeric value.` }
    }
    operandB = parsed
  } else {
    const metric = buildMetricReference(
      condition.operandBMetric,
      `${label} right metric`,
    )
    if (!metric.value) return { error: metric.error }
    operandB = metric.value
  }

  return {
    value: {
      logicalCombinator: index === 0 ? null : logicalCombinator,
      operator: condition.operator,
      operandA: operandA.value,
      operandB,
    },
  }
}

export function buildStrategyVersionPayload(
  form: StrategyVersionFormValue,
): BuildStrategyVersionResult {
  const errors: StrategyVersionFormErrors = {}
  if (!isAssetSymbol(form.primarySignalAsset)) {
    errors.primarySignalAsset = 'Choose a supported primary signal asset.'
  }
  if (!isAssetSymbol(form.executionAsset)) {
    errors.executionAsset = 'Choose a supported execution asset.'
  }

  const lag = Number(form.lag)
  if (!Number.isInteger(lag) || lag < 0) {
    errors.lag = 'Lag must be a whole number of zero or more sessions.'
  }

  const holdingSignalSessions = Number(form.holdingSignalSessions)
  if (!Number.isInteger(holdingSignalSessions) || holdingSignalSessions < 1) {
    errors.holdingSignalSessions =
      'Holding period must be at least one signal session.'
  }

  if (form.conditions.length === 0) {
    errors.conditions = 'Add at least one condition.'
  }
  const conditions: StrategyCondition[] = []
  for (const [index, condition] of form.conditions.entries()) {
    const built = buildCondition(condition, index, form.logicalCombinator)
    if (!built.value) {
      errors.conditions = built.error
      break
    }
    conditions.push(built.value)
  }

  if (
    Object.keys(errors).length > 0 ||
    !isAssetSymbol(form.primarySignalAsset) ||
    !isAssetSymbol(form.executionAsset)
  ) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    errors,
    payload: {
      primarySignalAsset: form.primarySignalAsset,
      conditions,
      executionAsset: form.executionAsset,
      lag,
      exit: { holdingSignalSessions },
    },
  }
}
