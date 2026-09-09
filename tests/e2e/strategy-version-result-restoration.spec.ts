import {
  expect,
  request,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test'

const accessToken = process.env.REFINVEST_E2E_ACCESS_TOKEN
const coreUrl = process.env.REFINVEST_E2E_CORE_URL ?? 'http://localhost:8080'
const webUrl = process.env.REFINVEST_E2E_WEB_URL ?? 'http://localhost:3001'
const csrfToken = 'web-e2e-csrf'

interface Strategy {
  id: string
}

interface StrategyVersion {
  id: string
}

interface BacktestRun {
  id: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  datasetSnapshotId?: string | null
  result?: {
    metrics: {
      mdd: number
    }
  } | null
}

test.describe('strategy version result restoration', () => {
  test.skip(!accessToken, 'REFINVEST_E2E_ACCESS_TOKEN is required.')

  test('restores the latest completed negative-drawdown result after direct navigation and refresh', async ({
    browser,
  }) => {
    if (!accessToken) {
      throw new Error('REFINVEST_E2E_ACCESS_TOKEN is required.')
    }

    const api = await createAuthenticatedApi(accessToken)
    try {
      const strategy = await createStrategy(api)
      const version = await createCrossMarketVersion(api, strategy.id)
      const previousRun = await startBacktestRun(api, version.id, 0)
      await waitForCompletedRun(api, previousRun.id)
      const latestRun = await startBacktestRun(api, version.id, 0.02)
      const completedRun = await waitForCompletedRun(api, latestRun.id)

      expect(completedRun.datasetSnapshotId).toBe('integration-e2e-v1')
      expect(completedRun.result?.metrics.mdd).toBeLessThan(0)

      const webHost = new URL(webUrl).hostname
      const authenticatedContext = await browser.newContext()
      await authenticatedContext.addCookies([
        {
          name: 'REFINVEST_ACCESS_TOKEN',
          value: accessToken,
          domain: webHost,
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ])

      const page = await authenticatedContext.newPage()
      await page.goto(`/strategies/${strategy.id}/versions/${version.id}`)
      const initialDrawdown = await expectRestoredResult(page)

      await page.reload()
      const refreshedDrawdown = await expectRestoredResult(page)
      expect(refreshedDrawdown).toBe(initialDrawdown)

      await authenticatedContext.close()
    } finally {
      await api.dispose()
    }
  })
})

async function createAuthenticatedApi(
  token: string,
): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: coreUrl,
    extraHTTPHeaders: {
      Cookie: `REFINVEST_ACCESS_TOKEN=${token}; XSRF-TOKEN=${csrfToken}`,
      'X-XSRF-TOKEN': csrfToken,
    },
  })
}

async function createStrategy(api: APIRequestContext): Promise<Strategy> {
  const response = await api.post('/strategies', {
    data: { name: `Web E2E restoration ${Date.now()}` },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

async function createCrossMarketVersion(
  api: APIRequestContext,
  strategyId: string,
): Promise<StrategyVersion> {
  const response = await api.post(`/strategies/${strategyId}/versions`, {
    data: {
      primarySignalAsset: 'BTCUSDT',
      executionAsset: 'TQQQ',
      lag: 0,
      conditions: [
        {
          operator: 'GT',
          logicalCombinator: null,
          operandA: { asset: 'BTCUSDT', metric: 'SIMPLE', window: null },
          operandB: 90000,
        },
        {
          operator: 'LT',
          logicalCombinator: 'AND',
          operandA: { asset: 'BTCUSDT', metric: 'SIMPLE', window: null },
          operandB: 92000,
        },
      ],
      exit: { holdingSignalSessions: 3 },
    },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

async function startBacktestRun(
  api: APIRequestContext,
  strategyVersionId: string,
  commission: number,
): Promise<BacktestRun> {
  const response = await api.post(`/strategy-versions/${strategyVersionId}/backtests`, {
    data: {
      period: { start: '2025-01-02', end: '2025-01-08' },
      feeModel: { commission, slippage: 0 },
    },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

async function waitForCompletedRun(
  api: APIRequestContext,
  runId: string,
): Promise<BacktestRun> {
  let latestRun: BacktestRun | undefined

  await expect
    .poll(
      async () => {
        const response = await api.get(`/backtest-runs/${runId}`)
        expect(response.ok()).toBeTruthy()
        const run: BacktestRun = await response.json()
        latestRun = run
        return run.status
      },
      { timeout: 120_000, intervals: [500, 1_000, 2_000] },
    )
    .toBe('COMPLETED')

  if (!latestRun) {
    throw new Error('Backtest status was not returned while waiting for completion.')
  }
  return latestRun
}

async function expectRestoredResult(page: Page): Promise<string> {
  await expect(page.getByText('Equity curve', { exact: true })).toBeVisible()
  await expect(page.getByText('Drawdown', { exact: true })).toBeVisible()
  await expect(page.getByText('Strategy', { exact: true }).first()).toBeVisible()
  await expect(
    page.getByText('Strategy compared with TQQQ buy & hold', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Trade timeline', { exact: true })).toBeVisible()

  const maxDrawdown = page.getByText('Max drawdown', { exact: true }).locator('..')
  await expect(maxDrawdown).toContainText(/-\d/)
  return (await maxDrawdown.textContent()) ?? ''
}
