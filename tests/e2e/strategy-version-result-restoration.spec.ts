import {
  expect,
  request,
  test,
  type APIRequestContext,
  type Page,
  type Response,
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
  requestedPeriod: {
    start: string
    end: string
  }
  feeModel: {
    commission: number
    slippage: number
  }
  errorCode?: string | null
  datasetSnapshotId?: string | null
  result?: {
    metrics: {
      mdd: number
    }
  } | null
}

interface LatestCompletedBacktestRunResponse {
  run: {
    id: string
    strategyVersionId: string
    status: 'COMPLETED'
  } | null
}

interface LatestTerminalBacktestRunResponse {
  run: {
    id: string
    strategyVersionId: string
    status: 'COMPLETED' | 'FAILED'
  } | null
}

test.describe('strategy version result restoration', () => {
  test.skip(!accessToken, 'REFINVEST_E2E_ACCESS_TOKEN is required.')

  test('restores the latest completed result and latest failed status after direct navigation and refresh', async ({
    browser,
  }) => {
    // This acceptance creates and waits for three asynchronous backtests. The
    // per-run poll allows 120 seconds, so Playwright's default 30-second test
    // timeout must not terminate the scenario while CI is still processing a
    // PENDING run.
    test.setTimeout(300_000)

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
      const failedPeriod = {
        start: '2024-01-02',
        end: '2024-01-08',
      }
      const failedFeeModel = { commission: 0.003, slippage: 0.001 }
      const failedRun = await startBacktestRun(
        api,
        version.id,
        failedFeeModel.commission,
        failedPeriod,
        failedFeeModel.slippage,
      )
      const failedStatus = await waitForFailedRun(api, failedRun.id)

      expect(completedRun.datasetSnapshotId).toBe('integration-e2e-v1')
      expect(completedRun.result?.metrics.mdd).toBeLessThan(0)
      expect(failedStatus.errorCode).toBe('CALENDAR_RESOLUTION_FAILED')

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
      const initialLatestRunResponse = waitForLatestCompletedRunResponse(
        page,
        version.id,
      )
      const initialLatestTerminalRunResponse = waitForLatestTerminalRunResponse(
        page,
        version.id,
      )
      await page.goto(`/strategies/${strategy.id}/versions/${version.id}`)
      await expectLatestCompletedRunResponse(
        await initialLatestRunResponse,
        version.id,
        completedRun.id,
      )
      await expectLatestTerminalRunResponse(
        await initialLatestTerminalRunResponse,
        version.id,
        failedStatus.id,
        'FAILED',
      )
      const initialDrawdown = await expectRestoredResult(page)
      await expectRestoredFailure(page)

      const retryResponse = waitForBacktestResponse(page, version.id)
      await page.getByRole('button', { name: 'Retry backtest' }).click()
      const retriedRunResponse = await retryResponse
      expect(retriedRunResponse.request().postDataJSON()).toEqual({
        period: failedPeriod,
        feeModel: failedFeeModel,
      })
      expect(retriedRunResponse.status()).toBe(202)
      const retriedRun: BacktestRun = await retriedRunResponse.json()
      expect(retriedRun.id).not.toBe(failedStatus.id)
      expect(retriedRun).toMatchObject({
        strategyVersionId: version.id,
        status: 'PENDING',
        requestedPeriod: failedPeriod,
        feeModel: failedFeeModel,
      })
      await expectRestoredResult(page)
      const retriedFailedStatus = await waitForFailedRun(api, retriedRun.id)

      const refreshedLatestRunResponse = waitForLatestCompletedRunResponse(
        page,
        version.id,
      )
      const refreshedLatestTerminalRunResponse = waitForLatestTerminalRunResponse(
        page,
        version.id,
      )
      await page.reload()
      await expectLatestCompletedRunResponse(
        await refreshedLatestRunResponse,
        version.id,
        completedRun.id,
      )
      await expectLatestTerminalRunResponse(
        await refreshedLatestTerminalRunResponse,
        version.id,
        retriedFailedStatus.id,
        'FAILED',
      )
      const refreshedDrawdown = await expectRestoredResult(page)
      await expectRestoredFailure(page)
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
  period = { start: '2025-01-02', end: '2025-01-08' },
  slippage = 0,
): Promise<BacktestRun> {
  const response = await api.post(`/strategy-versions/${strategyVersionId}/backtests`, {
    data: {
      period,
      feeModel: { commission, slippage },
    },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

async function waitForFailedRun(
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
    .toBe('FAILED')

  if (!latestRun) {
    throw new Error('Backtest status was not returned while waiting for failure.')
  }
  return latestRun
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

async function expectRestoredFailure(page: Page) {
  await expect(page.getByText('Backtest failed', { exact: true })).toBeVisible()
  await expect(
    page.getByText(
      'The trading calendar could not be resolved for this backtest. Please choose another date range and try again.',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(page.getByText('Failure code: CALENDAR_RESOLUTION_FAILED', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Adjust the request if needed, then use Run backtest to try again.', { exact: true }),
  ).toBeVisible()
}

function waitForLatestCompletedRunResponse(page: Page, strategyVersionId: string) {
  const path = `/strategy-versions/${encodeURIComponent(
    strategyVersionId,
  )}/backtest-runs/latest-completed`
  return page.waitForResponse(
    (response) =>
      response.url().endsWith(path) && response.request().method() === 'GET',
  )
}

function waitForLatestTerminalRunResponse(page: Page, strategyVersionId: string) {
  const path = `/strategy-versions/${encodeURIComponent(
    strategyVersionId,
  )}/backtest-runs/latest-terminal`
  return page.waitForResponse(
    (response) =>
      response.url().endsWith(path) && response.request().method() === 'GET',
  )
}

function waitForBacktestResponse(page: Page, strategyVersionId: string) {
  const path = `/strategy-versions/${encodeURIComponent(strategyVersionId)}/backtests`
  return page.waitForResponse(
    (response) =>
      response.url().endsWith(path) &&
      response.request().method() === 'POST',
  )
}

async function expectLatestCompletedRunResponse(
  response: Response,
  strategyVersionId: string,
  expectedRunId: string,
) {
  expect(response.status()).toBe(200)
  const body: LatestCompletedBacktestRunResponse = await response.json()
  expect(body.run).toMatchObject({
    id: expectedRunId,
    strategyVersionId,
    status: 'COMPLETED',
  })
}

async function expectLatestTerminalRunResponse(
  response: Response,
  strategyVersionId: string,
  expectedRunId: string,
  expectedStatus: 'COMPLETED' | 'FAILED',
) {
  expect(response.status()).toBe(200)
  const body: LatestTerminalBacktestRunResponse = await response.json()
  expect(body.run).toMatchObject({
    id: expectedRunId,
    strategyVersionId,
    status: expectedStatus,
  })
}
