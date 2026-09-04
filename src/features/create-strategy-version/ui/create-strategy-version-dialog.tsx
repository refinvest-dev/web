'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useAssetsQuery } from '@/entities/asset/api/queries'
import type {
  DefineStrategyVersionRequest,
  StrategyCondition,
} from '@/entities/strategy/model/types'
import { useCreateStrategyVersion } from '../api/use-create-strategy-version'
import { useStrategyVersionPreview } from '../api/use-strategy-version-preview'

interface CreateStrategyVersionDialogProps {
  strategyId: string
  onCreated?: () => void
}

interface FormErrors {
  primarySignalAsset?: string
  executionAsset?: string
  conditions?: string
  lag?: string
  holdingSignalSessions?: string
}

type ConditionMetric = 'SIMPLE' | 'RETURN' | 'CHANGE'
type ComparisonOperator = 'LT' | 'GT' | 'LTE' | 'GTE'

function isConditionMetric(value: string | null): value is ConditionMetric {
  return value === 'SIMPLE' || value === 'RETURN' || value === 'CHANGE'
}

function isComparisonOperator(value: string | null): value is ComparisonOperator {
  return value === 'LT' || value === 'GT' || value === 'LTE' || value === 'GTE'
}

function validateForm({
  primarySignalAsset,
  executionAsset,
  conditionAsset,
  conditionMetric,
  conditionWindow,
  conditionOperator,
  conditionThreshold,
  lag,
  holdingSignalSessions,
}: {
  primarySignalAsset: string
  executionAsset: string
  conditionAsset: string
  conditionMetric: ConditionMetric
  conditionWindow: string
  conditionOperator: ComparisonOperator
  conditionThreshold: string
  lag: string
  holdingSignalSessions: string
}): {
  errors: FormErrors
  body?: DefineStrategyVersionRequest
} {
  const errors: FormErrors = {}
  const primary = primarySignalAsset.trim()
  const execution = executionAsset.trim()
  const parsedLag = Number(lag)
  const parsedHoldingSessions = Number(holdingSignalSessions)

  if (!primary) errors.primarySignalAsset = 'Enter a primary signal asset.'
  if (!execution) errors.executionAsset = 'Enter an execution asset.'
  if (!Number.isInteger(parsedLag) || parsedLag < 0) {
    errors.lag = 'Lag must be a whole number of zero or more sessions.'
  }
  if (!Number.isInteger(parsedHoldingSessions) || parsedHoldingSessions < 1) {
    errors.holdingSignalSessions =
      'Holding period must be at least one signal session.'
  }

  const parsedWindow = Number(conditionWindow)
  const parsedThreshold = Number(conditionThreshold)
  if (!conditionAsset) errors.conditions = 'Choose the Asset for this condition.'
  if (conditionMetric !== 'SIMPLE' && (!Number.isInteger(parsedWindow) || parsedWindow < 1)) {
    errors.conditions = 'Lookback and change conditions require a whole-number window of at least 1.'
  }
  if (!Number.isFinite(parsedThreshold)) {
    errors.conditions = 'Enter a numeric threshold.'
  }

  if (Object.keys(errors).length > 0) return { errors }

  const conditions: StrategyCondition[] = [{
    operator: conditionOperator,
    operandA: {
      asset: conditionAsset,
      metric: conditionMetric,
      window: conditionMetric === 'SIMPLE' ? null : parsedWindow,
    },
    operandB: parsedThreshold,
  }]

  return {
    errors,
    body: {
      primarySignalAsset: primary,
      executionAsset: execution,
      conditions,
      lag: parsedLag,
      exit: { holdingSignalSessions: parsedHoldingSessions },
    },
  }
}

export function CreateStrategyVersionDialog({
  strategyId,
  onCreated,
}: CreateStrategyVersionDialogProps) {
  const [open, setOpen] = useState(false)
  const [primarySignalAsset, setPrimarySignalAsset] = useState('')
  const [executionAsset, setExecutionAsset] = useState('')
  const [conditionAsset, setConditionAsset] = useState('')
  const [conditionMetric, setConditionMetric] = useState<ConditionMetric>('SIMPLE')
  const [conditionWindow, setConditionWindow] = useState('1')
  const [conditionOperator, setConditionOperator] = useState<ComparisonOperator>('GT')
  const [conditionThreshold, setConditionThreshold] = useState('')
  const [lag, setLag] = useState('0')
  const [holdingSignalSessions, setHoldingSignalSessions] = useState('1')
  const [errors, setErrors] = useState<FormErrors>({})
  const assetsQuery = useAssetsQuery()
  const assets = assetsQuery.data?.assets ?? []
  const executionAssets = assets.filter((asset) => asset.executionEnabled)
  const previewBody = useMemo(
    () =>
      validateForm({
        primarySignalAsset,
        executionAsset,
        conditionAsset,
        conditionMetric,
        conditionWindow,
        conditionOperator,
        conditionThreshold,
        lag,
        holdingSignalSessions,
      }).body ?? null,
    [
      conditionAsset,
      conditionMetric,
      conditionWindow,
      conditionOperator,
      conditionThreshold,
      executionAsset,
      holdingSignalSessions,
      lag,
      primarySignalAsset,
    ],
  )
  const deferredPreviewBody = useDeferredValue(previewBody)
  const previewQuery = useStrategyVersionPreview(
    open ? strategyId : '',
    open ? deferredPreviewBody : null,
  )

  const { mutate, isPending, error, reset } = useCreateStrategyVersion({
    onCreated: () => {
      setOpen(false)
      onCreated?.()
    },
  })

  function resetForm() {
    setPrimarySignalAsset('')
    setExecutionAsset('')
    setConditionAsset('')
    setConditionMetric('SIMPLE')
    setConditionWindow('1')
    setConditionOperator('GT')
    setConditionThreshold('')
    setLag('0')
    setHoldingSignalSessions('1')
    setErrors({})
    reset()
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) resetForm()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateForm({
      primarySignalAsset,
      executionAsset,
      conditionAsset,
      conditionMetric,
      conditionWindow,
      conditionOperator,
      conditionThreshold,
      lag,
      holdingSignalSessions,
    })
    setErrors(result.errors)
    if (!result.body) return

    mutate({ strategyId, body: result.body })
  }

  const apiErrorMessage =
    error instanceof ApiError
      ? error.message
      : error
        ? 'Could not create the strategy version. Please try again.'
        : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus data-icon="inline-start" />
        Define version
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Define strategy version</DialogTitle>
          <DialogDescription>
            Versions are immutable. Define the signal and execution inputs for
            this version before running a backtest.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={errors.primarySignalAsset ? true : undefined}>
                <FieldLabel htmlFor="primary-signal-asset">
                  Primary signal asset
                </FieldLabel>
                <Select
                  value={primarySignalAsset}
                  onValueChange={(value) => setPrimarySignalAsset(value ?? '')}
                  disabled={isPending || assetsQuery.isPending || assetsQuery.isError}
                >
                  <SelectTrigger
                    id="primary-signal-asset"
                    aria-invalid={errors.primarySignalAsset ? true : undefined}
                    className="w-full"
                  >
                    <SelectValue placeholder="Choose an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        {asset.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.primarySignalAsset && (
                  <FieldError>{errors.primarySignalAsset}</FieldError>
                )}
              </Field>

              <Field data-invalid={errors.executionAsset ? true : undefined}>
                <FieldLabel htmlFor="execution-asset">Execution asset</FieldLabel>
                <Select
                  value={executionAsset}
                  onValueChange={(value) => setExecutionAsset(value ?? '')}
                  disabled={isPending || assetsQuery.isPending || assetsQuery.isError}
                >
                  <SelectTrigger
                    id="execution-asset"
                    aria-invalid={errors.executionAsset ? true : undefined}
                    className="w-full"
                  >
                    <SelectValue placeholder="Choose an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {executionAssets.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        {asset.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.executionAsset && (
                  <FieldError>{errors.executionAsset}</FieldError>
                )}
              </Field>
            </div>

            {assetsQuery.isPending ? (
              <FieldDescription>Loading supported assets…</FieldDescription>
            ) : assetsQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t load supported assets</AlertTitle>
                <AlertDescription>
                  <p>Please try again before defining this version.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 w-fit"
                    type="button"
                    onClick={() => assetsQuery.refetch()}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            <Field data-invalid={errors.conditions ? true : undefined}>
              <FieldLabel>Entry condition</FieldLabel>
              <div className="grid gap-3 sm:grid-cols-3">
                <Select
                  value={conditionAsset}
                  onValueChange={(value) => setConditionAsset(value ?? '')}
                  disabled={isPending || assetsQuery.isPending || assetsQuery.isError}
                >
                  <SelectTrigger aria-label="Condition asset" className="w-full">
                    <SelectValue placeholder="Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        {asset.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={conditionMetric}
                  onValueChange={(value) => {
                    if (isConditionMetric(value)) setConditionMetric(value)
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger aria-label="Condition metric" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">Simple</SelectItem>
                    <SelectItem value="RETURN">Lookback return</SelectItem>
                    <SelectItem value="CHANGE">Change</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={conditionOperator}
                  onValueChange={(value) => {
                    if (isComparisonOperator(value)) setConditionOperator(value)
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger aria-label="Condition comparison" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GT">Greater than</SelectItem>
                    <SelectItem value="GTE">At least</SelectItem>
                    <SelectItem value="LT">Less than</SelectItem>
                    <SelectItem value="LTE">At most</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {conditionMetric !== 'SIMPLE' && (
                  <Input
                    aria-label="Condition window in sessions"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={conditionWindow}
                    disabled={isPending}
                    onChange={(event) => setConditionWindow(event.target.value)}
                    placeholder="Window (sessions)"
                  />
                )}
                <Input
                  aria-label="Condition threshold"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={conditionThreshold}
                  disabled={isPending}
                  onChange={(event) => setConditionThreshold(event.target.value)}
                  placeholder="Threshold (e.g. 0.1)"
                  className={conditionMetric === 'SIMPLE' ? 'sm:col-span-2' : undefined}
                />
              </div>
              {errors.conditions ? (
                <FieldError>{errors.conditions}</FieldError>
              ) : (
                <FieldDescription>
                  Simple compares the current value. Lookback return and change use a positive session window.
                </FieldDescription>
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={errors.lag ? true : undefined}>
                <FieldLabel htmlFor="strategy-lag">Signal lag (sessions)</FieldLabel>
                <Input
                  id="strategy-lag"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={lag}
                  disabled={isPending}
                  aria-invalid={errors.lag ? true : undefined}
                  onChange={(event) => setLag(event.target.value)}
                />
                {errors.lag && <FieldError>{errors.lag}</FieldError>}
              </Field>

              <Field data-invalid={errors.holdingSignalSessions ? true : undefined}>
                <FieldLabel htmlFor="holding-signal-sessions">
                  Holding period (sessions)
                </FieldLabel>
                <Input
                  id="holding-signal-sessions"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={holdingSignalSessions}
                  disabled={isPending}
                  aria-invalid={errors.holdingSignalSessions ? true : undefined}
                  onChange={(event) => setHoldingSignalSessions(event.target.value)}
                />
                {errors.holdingSignalSessions && (
                  <FieldError>{errors.holdingSignalSessions}</FieldError>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel>Strategy preview</FieldLabel>
              <div
                aria-live="polite"
                className="min-h-12 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
              >
                {previewQuery.isFetching
                  ? 'Updating preview…'
                  : previewQuery.data
                    ? previewQuery.data.previewText
                    : previewQuery.isError
                      ? 'Preview is currently unavailable. You can still define the version when the form is valid.'
                      : 'Complete the required fields to preview this strategy.'}
              </div>
              <FieldDescription>
                The preview is generated from the same definition that will be saved.
              </FieldDescription>
            </Field>

            {apiErrorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t create strategy version</AlertTitle>
                <AlertDescription>{apiErrorMessage}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isPending ? 'Defining…' : 'Define version'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
