'use client'

import { Loader2, RotateCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import type { BacktestRunSummary } from '@/entities/backtest/model/types'
import { useRunBacktest } from '../api/use-run-backtest'
import { getRetryBacktestRequest } from '../model/get-retry-backtest-request'
import { getRunBacktestErrorMessage } from '../model/get-run-backtest-error-message'

export function RetryBacktestButton({
  run,
  onAccepted,
}: {
  run: BacktestRunSummary
  onAccepted: (runId: string) => void
}) {
  const retryRequest = getRetryBacktestRequest(run)
  const { mutate, isPending, error } = useRunBacktest({
    onAccepted: (acceptedRun) => onAccepted(acceptedRun.id),
  })
  const errorMessage = getRunBacktestErrorMessage(error)

  if (!retryRequest) {
    return (
      <p className="text-muted-foreground">
        This older backtest doesn&apos;t include the original request settings, so it can&apos;t be retried.
      </p>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      <Button
        type="button"
        size="sm"
        onClick={() => mutate(retryRequest)}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <RotateCw data-icon="inline-start" />
        )}
        {isPending ? 'Restarting…' : 'Retry backtest'}
      </Button>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t restart the backtest</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
