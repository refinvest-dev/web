import { expect, test, type Page } from '@playwright/test'

const coreUrl = process.env.REFINVEST_E2E_CORE_URL ?? 'http://localhost:8080'
const strategyId = 'strategy-builder-e2e'

interface MockApiState {
  previews: unknown[]
  saves: unknown[]
}

async function mockCore(page: Page): Promise<MockApiState> {
  const state: MockApiState = { previews: [], saves: [] }
  await page.context().addCookies([{
    name: 'XSRF-TOKEN',
    value: 'builder-e2e-csrf',
    domain: new URL(coreUrl).hostname,
    path: '/',
    sameSite: 'Lax',
  }])
  await page.route(`${coreUrl}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === `/strategies/${strategyId}` && request.method() === 'GET') {
      return route.fulfill({ json: {
        id: strategyId,
        name: 'Builder acceptance',
        createdAt: '2026-09-27T00:00:00Z',
        latestVersionId: null,
        versions: [],
      } })
    }
    if (url.pathname === '/assets' && request.method() === 'GET') {
      return route.fulfill({ json: { assets: ['QQQ', 'SPY', 'TQQQ', 'SOXL', 'BTCUSDT'].map((symbol) => ({
        symbol,
        calendar: symbol === 'BTCUSDT' ? 'CRYPTO_UTC' : 'US_EQUITY',
        inceptionDate: '2010-01-01',
        executionEnabled: true,
      })) } })
    }
    if (url.pathname.endsWith('/versions/preview') && request.method() === 'POST') {
      const body = request.postDataJSON()
      state.previews.push(body)
      return route.fulfill({ json: { previewText: previewText(body) } })
    }
    if (url.pathname.endsWith('/versions') && request.method() === 'POST') {
      const body = request.postDataJSON()
      state.saves.push(body)
      return route.fulfill({ status: 201, json: {
        id: `version-${state.saves.length}`,
        strategyId,
        createdAt: '2026-09-27T00:01:00Z',
        ...body,
      } })
    }
    return route.fulfill({ status: 404, json: { code: 'NOT_FOUND', message: url.pathname } })
  })
  return state
}

function previewText(body: { conditions: Array<{ operandB: unknown }> }) {
  return typeof body.conditions[0]?.operandB === 'number'
    ? 'Server preview: literal condition'
    : 'Server preview: relative condition'
}

async function openBuilder(page: Page) {
  await page.goto(`/strategies/${strategyId}`)
  await page.getByRole('button', { name: 'Define version' }).first().click()
  await expect(page.getByRole('heading', { name: 'Define strategy version' })).toBeVisible()
}

async function saveAndExpectSharedPayload(page: Page, state: MockApiState, expectedPreview: string) {
  await expect(page.getByText(expectedPreview, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Save immutable version' }).click()
  await expect.poll(() => state.saves.length).toBe(1)
  expect(state.previews.at(-1)).toEqual(state.saves[0])
}

test.describe('strategy version builder UI', () => {
  test('creates a Simple StrategyVersion and displays the server preview', async ({ page }) => {
    const state = await mockCore(page)
    await openBuilder(page)
    await page.getByRole('button', { name: /Current value check/ }).click()
    await saveAndExpectSharedPayload(page, state, 'Server preview: literal condition')
    expect(state.saves[0]).toMatchObject({
      primarySignalAsset: 'QQQ',
      executionAsset: 'QQQ',
      lag: 0,
      exit: { holdingSignalSessions: 1 },
      conditions: [{ logicalCombinator: null, operandB: 1000 }],
    })
  })

  test('creates an AND multi-condition StrategyVersion', async ({ page }) => {
    const state = await mockCore(page)
    await openBuilder(page)
    await page.getByRole('button', { name: /Two-market change/ }).click()
    await saveAndExpectSharedPayload(page, state, 'Server preview: literal condition')
    expect((state.saves[0] as { conditions: Array<{ logicalCombinator: unknown }> }).conditions)
      .toMatchObject([{ logicalCombinator: null }, { logicalCombinator: 'AND' }])
  })

  test('creates a relative cross-market StrategyVersion and preserves it across levels', async ({ page }) => {
    const state = await mockCore(page)
    await openBuilder(page)
    await page.getByRole('button', { name: /Cross-market relative study/ }).click()
    await expect(page.getByLabel('Condition right window in sessions')).toHaveValue('7')
    await page.getByRole('button', { name: /Level 1 · Simple/ }).click()
    await expect(page.getByText('Advanced definition preserved', { exact: true })).toBeVisible()
    await expect(page.getByText('RETURN (7 sessions)', { exact: true })).toBeVisible()
    await expect(page.getByText(/Relative right-side metric is preserved/)).toBeVisible()
    await page.getByRole('button', { name: /Level 3 · Advanced/ }).click()
    await expect(page.getByLabel('Condition right window in sessions')).toHaveValue('7')
    await saveAndExpectSharedPayload(page, state, 'Server preview: relative condition')
    expect(state.saves[0]).toMatchObject({
      primarySignalAsset: 'BTCUSDT',
      executionAsset: 'TQQQ',
      lag: 1,
      exit: { holdingSignalSessions: 3 },
      conditions: [{
        operandA: { asset: 'BTCUSDT', metric: 'RETURN', window: 7 },
        operandB: { asset: 'QQQ', metric: 'RETURN', window: 7 },
      }],
    })
  })

  test('templates remain editable and invalid window or threshold is not submitted', async ({ page }) => {
    const state = await mockCore(page)
    await openBuilder(page)
    await page.getByRole('button', { name: /Single-market change/ }).click()
    const threshold = page.getByLabel('Condition numeric value')
    await threshold.fill('-0.08')
    await expect.poll(() => state.previews.length).toBeGreaterThan(0)
    await expect.poll(() => ((state.previews.at(-1) as { conditions: Array<{ operandB: number }> }).conditions[0].operandB)).toBe(-0.08)

    const previewCount = state.previews.length
    await page.getByLabel('Condition left window in sessions').fill('0')
    await page.getByRole('button', { name: 'Save immutable version' }).click()
    await expect(page.getByText(/RETURN and CHANGE require a whole-number window/)).toBeVisible()
    await page.waitForTimeout(300)
    expect(state.previews.length).toBe(previewCount)
    expect(state.saves).toHaveLength(0)

    await page.getByLabel('Condition left window in sessions').fill('5')
    await threshold.fill('')
    await page.getByRole('button', { name: 'Save immutable version' }).click()
    await expect(page.getByText(/enter a finite numeric value/)).toBeVisible()
    await page.waitForTimeout(300)
    expect(state.saves).toHaveLength(0)
  })
})
