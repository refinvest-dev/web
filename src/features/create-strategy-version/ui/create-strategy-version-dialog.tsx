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

function validateForm({
  primarySignalAsset,
  executionAsset,
  conditionsJson,
  lag,
  holdingSignalSessions,
}: {
  primarySignalAsset: string
  executionAsset: string
  conditionsJson: string
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

  let conditions: StrategyCondition[] | undefined
  try {
    const parsed: unknown = JSON.parse(conditionsJson)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      errors.conditions = 'Enter a non-empty JSON array of conditions.'
    } else {
      conditions = parsed
    }
  } catch {
    errors.conditions = 'Conditions must be valid JSON.'
  }

  if (Object.keys(errors).length > 0 || !conditions) return { errors }

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
  const [conditionsJson, setConditionsJson] = useState('[]')
  const [lag, setLag] = useState('0')
  const [holdingSignalSessions, setHoldingSignalSessions] = useState('1')
  const [errors, setErrors] = useState<FormErrors>({})
  const previewBody = useMemo(
    () =>
      validateForm({
        primarySignalAsset,
        executionAsset,
        conditionsJson,
        lag,
        holdingSignalSessions,
      }).body ?? null,
    [
      conditionsJson,
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
    setConditionsJson('[]')
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
      conditionsJson,
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
                <Input
                  id="primary-signal-asset"
                  value={primarySignalAsset}
                  placeholder="e.g. QQQ"
                  disabled={isPending}
                  aria-invalid={errors.primarySignalAsset ? true : undefined}
                  onChange={(event) => setPrimarySignalAsset(event.target.value)}
                />
                {errors.primarySignalAsset && (
                  <FieldError>{errors.primarySignalAsset}</FieldError>
                )}
              </Field>

              <Field data-invalid={errors.executionAsset ? true : undefined}>
                <FieldLabel htmlFor="execution-asset">Execution asset</FieldLabel>
                <Input
                  id="execution-asset"
                  value={executionAsset}
                  placeholder="e.g. QQQ"
                  disabled={isPending}
                  aria-invalid={errors.executionAsset ? true : undefined}
                  onChange={(event) => setExecutionAsset(event.target.value)}
                />
                {errors.executionAsset && (
                  <FieldError>{errors.executionAsset}</FieldError>
                )}
              </Field>
            </div>

            <Field data-invalid={errors.conditions ? true : undefined}>
              <FieldLabel htmlFor="strategy-conditions">Conditions (JSON)</FieldLabel>
              <textarea
                id="strategy-conditions"
                value={conditionsJson}
                placeholder={'[\n  { ... }\n]'}
                disabled={isPending}
                aria-invalid={errors.conditions ? true : undefined}
                onChange={(event) => setConditionsJson(event.target.value)}
                className="min-h-28 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
              />
              {errors.conditions ? (
                <FieldError>{errors.conditions}</FieldError>
              ) : (
                <FieldDescription>
                  Enter a non-empty JSON array matching the Compute condition
                  schema.
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
