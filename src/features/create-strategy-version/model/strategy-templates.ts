import type { StrategyVersionFormValue } from './strategy-version-builder'

export interface StrategyTemplate {
  id: string
  name: string
  description: string
  value: StrategyVersionFormValue
}

export const STRATEGY_TEMPLATES: readonly StrategyTemplate[] = [
  {
    id: 'current-value-check',
    name: 'Current value check',
    description: 'QQQ current value above a configurable level.',
    value: {
      level: 1,
      primarySignalAsset: 'QQQ',
      executionAsset: 'QQQ',
      conditions: [{
        operandA: { asset: 'QQQ', metric: 'SIMPLE', window: '1' },
        operator: 'GT',
        operandBKind: 'LITERAL',
        literalValue: '1000',
        operandBMetric: { asset: 'QQQ', metric: 'SIMPLE', window: '1' },
      }],
      logicalCombinator: 'AND',
      lag: '0',
      holdingSignalSessions: '1',
    },
  },
  {
    id: 'single-market-change',
    name: 'Single-market change',
    description: 'QQQ five-session return below a configurable threshold.',
    value: {
      level: 2,
      primarySignalAsset: 'QQQ',
      executionAsset: 'QQQ',
      conditions: [{
        operandA: { asset: 'QQQ', metric: 'RETURN', window: '5' },
        operator: 'LT',
        operandBKind: 'LITERAL',
        literalValue: '-0.07',
        operandBMetric: { asset: 'QQQ', metric: 'RETURN', window: '5' },
      }],
      logicalCombinator: 'AND',
      lag: '0',
      holdingSignalSessions: '1',
    },
  },
  {
    id: 'two-market-change',
    name: 'Two-market change',
    description: 'QQQ and SPY five-session return conditions combined with AND.',
    value: {
      level: 2,
      primarySignalAsset: 'QQQ',
      executionAsset: 'QQQ',
      conditions: [
        {
          operandA: { asset: 'QQQ', metric: 'RETURN', window: '5' },
          operator: 'LT',
          operandBKind: 'LITERAL',
          literalValue: '-0.07',
          operandBMetric: { asset: 'QQQ', metric: 'RETURN', window: '5' },
        },
        {
          operandA: { asset: 'SPY', metric: 'RETURN', window: '5' },
          operator: 'LT',
          operandBKind: 'LITERAL',
          literalValue: '-0.05',
          operandBMetric: { asset: 'SPY', metric: 'RETURN', window: '5' },
        },
      ],
      logicalCombinator: 'AND',
      lag: '0',
      holdingSignalSessions: '1',
    },
  },
  {
    id: 'cross-market-relative-lag',
    name: 'Cross-market relative study',
    description: 'BTCUSDT and QQQ relative returns with TQQQ execution and lag.',
    value: {
      level: 3,
      primarySignalAsset: 'BTCUSDT',
      executionAsset: 'TQQQ',
      conditions: [{
        operandA: { asset: 'BTCUSDT', metric: 'RETURN', window: '7' },
        operator: 'GT',
        operandBKind: 'METRIC_REFERENCE',
        literalValue: '0',
        operandBMetric: { asset: 'QQQ', metric: 'RETURN', window: '7' },
      }],
      logicalCombinator: 'AND',
      lag: '1',
      holdingSignalSessions: '3',
    },
  },
]

export function applyStrategyTemplate(
  template: StrategyTemplate,
): StrategyVersionFormValue {
  return structuredClone(template.value)
}
