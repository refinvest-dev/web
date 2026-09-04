'use client'

import { useState } from 'react'
import { Loader2, Play } from 'lucide-react'
import { ApiError } from '@/shared/api/http'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { useAssetAvailabilityQuery } from '@/entities/asset/api/queries'
import type { RunBacktestRequest } from '@/entities/backtest/model/types'
import { useRunBacktest } from '../api/use-run-backtest'

interface FormErrors {
  start?: string
  end?: string
  commission?: string
  slippage?: string
}

interface AvailablePeriod {
  start: string
  end: string
}

function validateForm(values: {
  start: string
  end: string
  commission: string
  slippage: string
  availablePeriod: AvailablePeriod
}): { errors: FormErrors; body?: RunBacktestRequest } {
  const errors: FormErrors = {}
  const commission = Number(values.commission)
  const slippage = Number(values.slippage)

  if (!values.start) errors.start = 'Choose a start date.'
  if (!values.end) errors.end = 'Choose an end date.'
  if (values.start && values.end && values.start > values.end) {
    errors.end = 'End date must be on or after the start date.'
  }
  if (values.start && values.start < values.availablePeriod.start) {
    errors.start = `Start date must be on or after ${values.availablePeriod.start}.`
  }
  if (values.end && values.end > values.availablePeriod.end) {
    errors.end = `End date must be on or before ${values.availablePeriod.end}.`
  }
  if (!Number.isFinite(commission) || commission < 0) {
    errors.commission = 'Enter a non-negative decimal ratio.'
  }
  if (!Number.isFinite(slippage) || slippage < 0) {
    errors.slippage = 'Enter a non-negative decimal ratio.'
  }

  if (Object.keys(errors).length > 0) return { errors }

  return {
    errors,
    body: {
      period: { start: values.start, end: values.end },
      feeModel: { commission, slippage },
    },
  }
}

export function RunBacktestDialog({
  strategyVersionId,
  primarySignalAsset,
  executionAsset,
  onAccepted,
}: {
  strategyVersionId: string
  primarySignalAsset: string
  executionAsset: string
  onAccepted: (runId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [commission, setCommission] = useState('')
  const [slippage, setSlippage] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const primaryAvailabilityQuery = useAssetAvailabilityQuery(
    primarySignalAsset,
    open,
  )
  const executionAvailabilityQuery = useAssetAvailabilityQuery(
    executionAsset,
    open,
  )
  const availablePeriod = getOverlappingPeriod(
    primaryAvailabilityQuery.data?.dataAvailability,
    executionAvailabilityQuery.data?.dataAvailability,
  )
  const isAvailabilityLoading =
    primaryAvailabilityQuery.isPending || executionAvailabilityQuery.isPending
  const isAvailabilityError =
    primaryAvailabilityQuery.isError || executionAvailabilityQuery.isError
  const { mutate, isPending, error, reset } = useRunBacktest({
    onAccepted: (run) => {
      setOpen(false)
      onAccepted(run.id)
    },
  })

  function resetForm() {
    setStart('')
    setEnd('')
    setCommission('')
    setSlippage('')
    setErrors({})
    reset()
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) resetForm()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!availablePeriod) return
    const result = validateForm({
      start,
      end,
      commission,
      slippage,
      availablePeriod,
    })
    setErrors(result.errors)
    if (!result.body) return
    mutate({ strategyVersionId, body: result.body })
  }

  const apiErrorMessage =
    error instanceof ApiError
      ? error.message
      : error
        ? 'Could not start the backtest. Please try again.'
        : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Play data-icon="inline-start" />
        Run backtest
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Run backtest</DialogTitle>
          <DialogDescription>
            The run starts asynchronously. Results become available when the
            calculation completes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={errors.start ? true : undefined}>
                <FieldLabel htmlFor="backtest-start">Start date</FieldLabel>
                <Input
                  id="backtest-start"
                  type="date"
                  min={availablePeriod?.start}
                  max={availablePeriod?.end}
                  value={start}
                  disabled={isPending || isAvailabilityLoading || isAvailabilityError || !availablePeriod}
                  aria-invalid={errors.start ? true : undefined}
                  onChange={(event) => setStart(event.target.value)}
                />
                {errors.start && <FieldError>{errors.start}</FieldError>}
              </Field>
              <Field data-invalid={errors.end ? true : undefined}>
                <FieldLabel htmlFor="backtest-end">End date</FieldLabel>
                <Input
                  id="backtest-end"
                  type="date"
                  min={availablePeriod?.start}
                  max={availablePeriod?.end}
                  value={end}
                  disabled={isPending || isAvailabilityLoading || isAvailabilityError || !availablePeriod}
                  aria-invalid={errors.end ? true : undefined}
                  onChange={(event) => setEnd(event.target.value)}
                />
                {errors.end && <FieldError>{errors.end}</FieldError>}
              </Field>
            </div>

            {isAvailabilityLoading ? (
              <FieldDescription>Loading the shared Asset data range…</FieldDescription>
            ) : isAvailabilityError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t load Asset availability</AlertTitle>
                <AlertDescription>
                  <p>Please try again before starting this backtest.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="mt-1 w-fit"
                    onClick={() => {
                      primaryAvailabilityQuery.refetch()
                      executionAvailabilityQuery.refetch()
                    }}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : !availablePeriod ? (
              <Alert variant="destructive">
                <AlertTitle>No shared data range</AlertTitle>
                <AlertDescription>
                  The selected signal and execution Assets do not have an overlapping data range.
                </AlertDescription>
              </Alert>
            ) : (
              <FieldDescription>
                Available for both Assets: {availablePeriod.start} to {availablePeriod.end}.
              </FieldDescription>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={errors.commission ? true : undefined}>
                <FieldLabel htmlFor="backtest-commission">Commission</FieldLabel>
                <Input
                  id="backtest-commission"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="0.001"
                  value={commission}
                  disabled={isPending}
                  aria-invalid={errors.commission ? true : undefined}
                  onChange={(event) => setCommission(event.target.value)}
                />
                {errors.commission ? (
                  <FieldError>{errors.commission}</FieldError>
                ) : (
                  <FieldDescription>Decimal ratio; 0.001 equals 0.1%.</FieldDescription>
                )}
              </Field>
              <Field data-invalid={errors.slippage ? true : undefined}>
                <FieldLabel htmlFor="backtest-slippage">Slippage</FieldLabel>
                <Input
                  id="backtest-slippage"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="0.001"
                  value={slippage}
                  disabled={isPending}
                  aria-invalid={errors.slippage ? true : undefined}
                  onChange={(event) => setSlippage(event.target.value)}
                />
                {errors.slippage ? (
                  <FieldError>{errors.slippage}</FieldError>
                ) : (
                  <FieldDescription>Decimal ratio; 0.001 equals 0.1%.</FieldDescription>
                )}
              </Field>
            </div>

            {apiErrorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t start the backtest</AlertTitle>
                <AlertDescription>{apiErrorMessage}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending || isAvailabilityLoading || isAvailabilityError || !availablePeriod}
            >
              {isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isPending ? 'Starting…' : 'Start backtest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getOverlappingPeriod(
  primary: { firstDate: string; lastDate: string } | undefined,
  execution: { firstDate: string; lastDate: string } | undefined,
): AvailablePeriod | null {
  if (!primary || !execution) return null

  const start = primary.firstDate > execution.firstDate
    ? primary.firstDate
    : execution.firstDate
  const end = primary.lastDate < execution.lastDate
    ? primary.lastDate
    : execution.lastDate

  return start <= end ? { start, end } : null
}
