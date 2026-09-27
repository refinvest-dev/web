import { expect, test } from '@playwright/test'
import {
  buildStrategyVersionPayload,
  createInitialStrategyVersionForm,
  type StrategyVersionFormValue,
} from '../../src/features/create-strategy-version/model/strategy-version-builder'
import {
  applyStrategyTemplate,
  STRATEGY_TEMPLATES,
} from '../../src/features/create-strategy-version/model/strategy-templates'

function validForm(): StrategyVersionFormValue {
  return {
    ...createInitialStrategyVersionForm(),
    primarySignalAsset: 'QQQ',
    executionAsset: 'QQQ',
    conditions: [{
      operandA: { asset: 'QQQ', metric: 'SIMPLE', window: '99' },
      operator: 'GT',
      operandBKind: 'LITERAL',
      literalValue: '1000',
      operandBMetric: { asset: 'SPY', metric: 'RETURN', window: '5' },
    }],
  }
}

test.describe('strategy version payload builder', () => {
  test('builds literal conditions and normalizes SIMPLE window to null', () => {
    const result = buildStrategyVersionPayload(validForm())
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.payload).toEqual({
      primarySignalAsset: 'QQQ',
      executionAsset: 'QQQ',
      lag: 0,
      exit: { holdingSignalSessions: 1 },
      conditions: [{
        logicalCombinator: null,
        operator: 'GT',
        operandA: { asset: 'QQQ', metric: 'SIMPLE', window: null },
        operandB: 1000,
      }],
    })
  })

  test('builds a relative cross-market condition', () => {
    const template = STRATEGY_TEMPLATES.find((item) => item.id === 'cross-market-relative-lag')
    expect(template).toBeTruthy()
    const result = buildStrategyVersionPayload(applyStrategyTemplate(template!))
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.payload).toEqual({
      primarySignalAsset: 'BTCUSDT',
      executionAsset: 'TQQQ',
      lag: 1,
      exit: { holdingSignalSessions: 3 },
      conditions: [{
        logicalCombinator: null,
        operator: 'GT',
        operandA: { asset: 'BTCUSDT', metric: 'RETURN', window: 7 },
        operandB: { asset: 'QQQ', metric: 'RETURN', window: 7 },
      }],
    })
  })

  test('validates SIMPLE, RETURN, and CHANGE windows', () => {
    const simple = validForm()
    simple.conditions[0].operandA.window = '0'
    expect(buildStrategyVersionPayload(simple).ok).toBe(true)

    for (const metric of ['RETURN', 'CHANGE'] as const) {
      const invalid = validForm()
      invalid.conditions[0].operandA.metric = metric
      invalid.conditions[0].operandA.window = '0'
      expect(buildStrategyVersionPayload(invalid)).toMatchObject({ ok: false })

      invalid.conditions[0].operandA.window = '2.5'
      expect(buildStrategyVersionPayload(invalid)).toMatchObject({ ok: false })

      invalid.conditions[0].operandA.window = '5'
      expect(buildStrategyVersionPayload(invalid)).toMatchObject({ ok: true })
    }
  })

  test('serializes null for the first combinator and AND or OR for following conditions', () => {
    for (const logicalCombinator of ['AND', 'OR'] as const) {
      const form = validForm()
      form.logicalCombinator = logicalCombinator
      form.conditions.push({
        ...form.conditions[0],
        operandA: { asset: 'SPY', metric: 'RETURN', window: '5' },
        literalValue: '-0.05',
      })
      const result = buildStrategyVersionPayload(form)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.payload.conditions.map((condition) => condition.logicalCombinator)).toEqual([
          null,
          logicalCombinator,
        ])
      }
    }
  })

  test('level transitions preserve values and template copies remain editable', () => {
    const template = STRATEGY_TEMPLATES[3]
    const form = applyStrategyTemplate(template)
    const original = structuredClone(form)
    const levelOne = { ...form, level: 1 as const }
    const levelThree = { ...levelOne, level: 3 as const }
    expect({ ...levelThree, level: original.level }).toEqual(original)

    form.conditions[0].operandBMetric.asset = 'SPY'
    form.lag = '4'
    expect(template.value.conditions[0].operandBMetric.asset).toBe('QQQ')
    expect(template.value.lag).toBe('1')
    expect(buildStrategyVersionPayload(form)).toMatchObject({ ok: true })
  })

  test('rejects empty and non-finite literal thresholds', () => {
    for (const literalValue of ['', 'Infinity', 'not-a-number']) {
      const form = validForm()
      form.conditions[0].literalValue = literalValue
      expect(buildStrategyVersionPayload(form)).toMatchObject({ ok: false })
    }
  })
})
