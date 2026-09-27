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
import type { ComparisonOperator, MetricType } from '@/entities/strategy/model/types'
import { useCreateStrategyVersion } from '../api/use-create-strategy-version'
import { useStrategyVersionPreview } from '../api/use-strategy-version-preview'
import {
  buildStrategyVersionPayload,
  createEmptyCondition,
  createInitialStrategyVersionForm,
  type BuilderLevel,
  type ConditionFormValue,
  type OperandBKind,
  type StrategyVersionFormErrors,
  type StrategyVersionFormValue,
} from '../model/strategy-version-builder'
import { applyStrategyTemplate, STRATEGY_TEMPLATES } from '../model/strategy-templates'

interface CreateStrategyVersionDialogProps {
  strategyId: string
  onCreated?: () => void
}

const LEVELS: readonly { level: BuilderLevel; title: string; detail: string }[] = [
  { level: 1, title: 'Level 1 · Simple', detail: 'One current-value condition' },
  { level: 2, title: 'Level 2 · Configure', detail: 'Windows, execution, timing, combinations' },
  { level: 3, title: 'Level 3 · Advanced', detail: 'Explicit signal asset and relative metrics' },
]

function isMetricType(value: string | null): value is MetricType {
  return value === 'SIMPLE' || value === 'RETURN' || value === 'CHANGE'
}

function isComparisonOperator(value: string | null): value is ComparisonOperator {
  return value === 'LT' || value === 'GT' || value === 'LTE' || value === 'GTE'
}

function isOperandBKind(value: string | null): value is OperandBKind {
  return value === 'LITERAL' || value === 'METRIC_REFERENCE'
}

function requiredLevel(form: StrategyVersionFormValue): BuilderLevel {
  const firstAsset = form.conditions[0]?.operandA.asset
  if (
    form.conditions.some((condition) => condition.operandBKind === 'METRIC_REFERENCE') ||
    (form.primarySignalAsset !== '' && form.primarySignalAsset !== firstAsset)
  ) return 3

  if (
    form.conditions.length > 1 ||
    form.conditions.some((condition) => condition.operandA.metric !== 'SIMPLE') ||
    (form.executionAsset !== '' && form.executionAsset !== firstAsset) ||
    form.lag !== '0' ||
    form.holdingSignalSessions !== '1'
  ) return 2

  return 1
}

export function CreateStrategyVersionDialog({ strategyId, onCreated }: CreateStrategyVersionDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<StrategyVersionFormValue>(createInitialStrategyVersionForm)
  const [errors, setErrors] = useState<StrategyVersionFormErrors>({})
  const assetsQuery = useAssetsQuery()
  const assets = assetsQuery.data?.assets ?? []
  const executionAssets = assets.filter((asset) => asset.executionEnabled)
  const definitionLevel = requiredLevel(form)

  const buildResult = useMemo(() => buildStrategyVersionPayload(form), [form])
  const previewPayload = buildResult.ok ? buildResult.payload : null
  const deferredPreviewPayload = useDeferredValue(previewPayload)
  const previewQuery = useStrategyVersionPreview(
    open ? strategyId : '',
    open ? deferredPreviewPayload : null,
  )

  const createMutation = useCreateStrategyVersion({
    onCreated: () => {
      setOpen(false)
      onCreated?.()
    },
  })

  function resetForm() {
    setForm(createInitialStrategyVersionForm())
    setErrors({})
    createMutation.reset()
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) resetForm()
  }

  function updateCondition(index: number, update: (condition: ConditionFormValue) => ConditionFormValue) {
    setForm((current) => ({
      ...current,
      conditions: current.conditions.map((condition, conditionIndex) =>
        conditionIndex === index ? update(condition) : condition,
      ),
    }))
  }

  function updateFirstConditionAsset(asset: string) {
    setForm((current) => {
      const previousAsset = current.conditions[0]?.operandA.asset ?? ''
      const conditions = current.conditions.map((condition, index) =>
        index === 0 ? { ...condition, operandA: { ...condition.operandA, asset } } : condition,
      )
      if (current.level !== 1) return { ...current, conditions }
      return {
        ...current,
        conditions,
        primarySignalAsset:
          !current.primarySignalAsset || current.primarySignalAsset === previousAsset
            ? asset
            : current.primarySignalAsset,
        executionAsset:
          !current.executionAsset || current.executionAsset === previousAsset
            ? asset
            : current.executionAsset,
      }
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = buildStrategyVersionPayload(form)
    setErrors(result.errors)
    if (!result.ok) return
    createMutation.mutate({ strategyId, body: result.payload })
  }

  const saveErrorMessage =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? 'Could not create the strategy version. Please try again.'
        : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus data-icon="inline-start" />
        Define version
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Define strategy version</DialogTitle>
          <DialogDescription>
            Preview a contract-valid definition, then save it as an immutable version.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <section aria-labelledby="builder-level-heading" className="space-y-2">
              <div>
                <h3 id="builder-level-heading" className="text-sm font-medium">Builder level</h3>
                <p className="text-xs text-muted-foreground">Moving between levels preserves every value you entered.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {LEVELS.map(({ level, title, detail }) => (
                  <Button
                    key={level}
                    type="button"
                    variant={form.level === level ? 'secondary' : 'outline'}
                    className="h-auto justify-start px-3 py-2 text-left"
                    aria-pressed={form.level === level}
                    disabled={createMutation.isPending}
                    onClick={() => setForm((current) => ({ ...current, level }))}
                  >
                    <span className="flex flex-col items-start">
                      <span>{title}</span>
                      <span className="text-xs font-normal text-muted-foreground">{detail}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </section>

            {form.level < definitionLevel && (
              <Alert>
                <AlertTitle>Advanced definition preserved</AlertTitle>
                <AlertDescription>
                  This definition still includes Level {definitionLevel} values. They remain part of Preview and Save; reopen that level to review or edit them.
                </AlertDescription>
              </Alert>
            )}

            <section aria-labelledby="templates-heading" className="space-y-2">
              <div>
                <h3 id="templates-heading" className="text-sm font-medium">Starting templates</h3>
                <p className="text-xs text-muted-foreground">
                  Editable starting points for defining a simulation on historical data—not recommendations or return guarantees.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {STRATEGY_TEMPLATES.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant="outline"
                    className="h-auto justify-start px-3 py-2 text-left"
                    disabled={createMutation.isPending}
                    onClick={() => {
                      setForm(applyStrategyTemplate(template))
                      setErrors({})
                      createMutation.reset()
                    }}
                  >
                    <span className="flex flex-col items-start">
                      <span>{template.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{template.description}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </section>

            {assetsQuery.isPending ? (
              <FieldDescription>Loading supported assets…</FieldDescription>
            ) : assetsQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t load supported assets</AlertTitle>
                <AlertDescription>
                  <p>Please retry before defining this version.</p>
                  <Button variant="outline" size="sm" className="mt-1 w-fit" type="button" onClick={() => assetsQuery.refetch()}>Retry</Button>
                </AlertDescription>
              </Alert>
            ) : null}

            {form.level === 3 ? (
              <AssetField
                id="primary-signal-asset"
                label="Primary signal asset"
                value={form.primarySignalAsset}
                error={errors.primarySignalAsset}
                assets={assets.map((asset) => asset.symbol)}
                disabled={createMutation.isPending || assetsQuery.isPending || assetsQuery.isError}
                onChange={(primarySignalAsset) => setForm((current) => ({ ...current, primarySignalAsset }))}
              />
            ) : (
              <FieldDescription>
                Primary signal asset: <span className="font-mono text-foreground">{form.primarySignalAsset || 'select the first condition asset'}</span>. Level 3 lets you set it explicitly.
              </FieldDescription>
            )}

            {form.conditions.map((condition, index) => (
              <ConditionEditor
                key={index}
                index={index}
                condition={condition}
                level={form.level}
                assets={assets.map((asset) => asset.symbol)}
                disabled={createMutation.isPending || assetsQuery.isPending || assetsQuery.isError}
                logicalCombinator={form.logicalCombinator}
                onLogicalCombinatorChange={(logicalCombinator) => setForm((current) => ({ ...current, logicalCombinator }))}
                onFirstAssetChange={index === 0 ? updateFirstConditionAsset : undefined}
                onChange={(next) => updateCondition(index, () => next)}
                onRemove={index > 0 ? () => setForm((current) => ({ ...current, conditions: current.conditions.filter((_, itemIndex) => itemIndex !== index) })) : undefined}
              />
            ))}

            {errors.conditions && <FieldError>{errors.conditions}</FieldError>}

            {form.level >= 2 && form.conditions.length === 1 && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-fit"
                disabled={createMutation.isPending}
                onClick={() => setForm((current) => ({ ...current, conditions: [...current.conditions, createEmptyCondition()] }))}
              >
                <Plus data-icon="inline-start" />
                Add condition
              </Button>
            )}

            {form.level >= 2 ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <AssetField
                  id="execution-asset"
                  label="Execution asset"
                  value={form.executionAsset}
                  error={errors.executionAsset}
                  assets={executionAssets.map((asset) => asset.symbol)}
                  disabled={createMutation.isPending || assetsQuery.isPending || assetsQuery.isError}
                  onChange={(executionAsset) => setForm((current) => ({ ...current, executionAsset }))}
                />
                <NumberField id="strategy-lag" label="Signal lag (sessions)" value={form.lag} min={0} error={errors.lag} disabled={createMutation.isPending} onChange={(lag) => setForm((current) => ({ ...current, lag }))} />
                <NumberField id="holding-signal-sessions" label="Holding signal sessions" value={form.holdingSignalSessions} min={1} error={errors.holdingSignalSessions} disabled={createMutation.isPending} onChange={(holdingSignalSessions) => setForm((current) => ({ ...current, holdingSignalSessions }))} />
              </div>
            ) : (
              <FieldDescription>
                Execution asset: <span className="font-mono text-foreground">{form.executionAsset || 'select the first condition asset'}</span>, Lag {form.lag}, Holding {form.holdingSignalSessions}. Level 2 lets you edit these values.
              </FieldDescription>
            )}

            <Field>
              <FieldLabel>Strategy preview</FieldLabel>
              <div aria-live="polite" className="min-h-12 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {previewQuery.isFetching
                  ? 'Updating preview…'
                  : previewQuery.data
                    ? previewQuery.data.previewText
                    : previewQuery.isError
                      ? 'Preview failed. Check the connection and try editing the definition again.'
                      : 'Complete the required fields with valid values to request a preview.'}
              </div>
              <FieldDescription>Preview and save use the same validated request payload.</FieldDescription>
              {previewQuery.isError && <FieldError>Preview could not be generated. No version has been saved.</FieldError>}
            </Field>

            {saveErrorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t save strategy version</AlertTitle>
                <AlertDescription>{saveErrorMessage}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit" disabled={createMutation.isPending || assetsQuery.isError}>
              {createMutation.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {createMutation.isPending ? 'Saving…' : 'Save immutable version'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ConditionEditor({ index, condition, level, assets, disabled, logicalCombinator, onLogicalCombinatorChange, onFirstAssetChange, onChange, onRemove }: {
  index: number
  condition: ConditionFormValue
  level: BuilderLevel
  assets: string[]
  disabled: boolean
  logicalCombinator: 'AND' | 'OR'
  onLogicalCombinatorChange: (value: 'AND' | 'OR') => void
  onFirstAssetChange?: (value: string) => void
  onChange: (value: ConditionFormValue) => void
  onRemove?: () => void
}) {
  const prefix = index === 0 ? 'Condition' : `Condition ${index + 1}`
  const update = (partial: Partial<ConditionFormValue>) => onChange({ ...condition, ...partial })

  return (
    <Field>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel>{prefix}</FieldLabel>
        {onRemove && <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onRemove}>Remove</Button>}
      </div>
      {index > 0 && (
        <Select value={logicalCombinator} onValueChange={(value) => {
          if (value === 'AND' || value === 'OR') onLogicalCombinatorChange(value)
        }} disabled={disabled}>
          <SelectTrigger aria-label="Combine conditions with" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="AND">AND</SelectItem><SelectItem value="OR">OR</SelectItem></SelectContent>
        </Select>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <AssetSelect
          label={`${prefix} left asset`}
          value={condition.operandA.asset}
          assets={assets}
          disabled={disabled}
          onChange={(asset) => {
            if (onFirstAssetChange) onFirstAssetChange(asset)
            else update({ operandA: { ...condition.operandA, asset } })
          }}
        />
        {level >= 2 ? (
          <MetricSelect label={`${prefix} left metric`} value={condition.operandA.metric} disabled={disabled} onChange={(metric) => update({ operandA: { ...condition.operandA, metric } })} />
        ) : (
          <div className="flex h-8 items-center rounded-lg border border-border px-3 text-sm">
            {condition.operandA.metric === 'SIMPLE'
              ? 'Current value'
              : `${condition.operandA.metric} (${condition.operandA.window} sessions)`}
          </div>
        )}
        <OperatorSelect label={`${prefix} comparison`} value={condition.operator} disabled={disabled} onChange={(operator) => update({ operator })} />
      </div>
      {level >= 2 && condition.operandA.metric !== 'SIMPLE' && (
        <Input aria-label={`${prefix} left window in sessions`} type="number" min="1" step="1" inputMode="numeric" value={condition.operandA.window} disabled={disabled} onChange={(event) => update({ operandA: { ...condition.operandA, window: event.target.value } })} placeholder="Left window (sessions)" />
      )}

      {level >= 3 && (
        <Select value={condition.operandBKind} onValueChange={(value) => {
          if (isOperandBKind(value)) update({ operandBKind: value })
        }} disabled={disabled}>
          <SelectTrigger aria-label={`${prefix} right operand type`} className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="LITERAL">Numeric value</SelectItem><SelectItem value="METRIC_REFERENCE">Another asset metric</SelectItem></SelectContent>
        </Select>
      )}

      {condition.operandBKind === 'METRIC_REFERENCE' ? (
        level >= 3 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <AssetSelect label={`${prefix} right asset`} value={condition.operandBMetric.asset} assets={assets} disabled={disabled} onChange={(asset) => update({ operandBMetric: { ...condition.operandBMetric, asset } })} />
            <MetricSelect label={`${prefix} right metric`} value={condition.operandBMetric.metric} disabled={disabled} onChange={(metric) => update({ operandBMetric: { ...condition.operandBMetric, metric } })} />
            {condition.operandBMetric.metric === 'SIMPLE' ? (
              <div className="flex h-8 items-center rounded-lg border border-border px-3 text-sm text-muted-foreground">No window</div>
            ) : (
              <Input aria-label={`${prefix} right window in sessions`} type="number" min="1" step="1" inputMode="numeric" value={condition.operandBMetric.window} disabled={disabled} onChange={(event) => update({ operandBMetric: { ...condition.operandBMetric, window: event.target.value } })} placeholder="Right window" />
            )}
          </div>
        ) : (
          <FieldDescription>Relative right-side metric is preserved. Open Level 3 to edit it.</FieldDescription>
        )
      ) : (
        <Input aria-label={`${prefix} numeric value`} type="number" step="any" inputMode="decimal" value={condition.literalValue} disabled={disabled} onChange={(event) => update({ literalValue: event.target.value })} placeholder="Numeric value (for example -0.07)" />
      )}
    </Field>
  )
}

function AssetField({ id, label, value, error, assets, disabled, onChange }: {
  id: string
  label: string
  value: string
  error?: string
  assets: string[]
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={(next) => onChange(next ?? '')} disabled={disabled}>
        <SelectTrigger id={id} aria-invalid={error ? true : undefined} className="w-full"><SelectValue placeholder="Choose an asset" /></SelectTrigger>
        <SelectContent>{assets.map((asset) => <SelectItem key={asset} value={asset}>{asset}</SelectItem>)}</SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

function NumberField({ id, label, value, min, error, disabled, onChange }: {
  id: string
  label: string
  value: string
  min: number
  error?: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} type="number" min={String(min)} step="1" inputMode="numeric" value={value} disabled={disabled} aria-invalid={error ? true : undefined} onChange={(event) => onChange(event.target.value)} />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

function AssetSelect({ label, value, assets, disabled, onChange }: {
  label: string
  value: string
  assets: string[]
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? '')} disabled={disabled}>
      <SelectTrigger aria-label={label} className="w-full"><SelectValue placeholder="Asset" /></SelectTrigger>
      <SelectContent>{assets.map((asset) => <SelectItem key={asset} value={asset}>{asset}</SelectItem>)}</SelectContent>
    </Select>
  )
}

function MetricSelect({ label, value, disabled, onChange }: {
  label: string
  value: MetricType
  disabled: boolean
  onChange: (value: MetricType) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => { if (isMetricType(next)) onChange(next) }} disabled={disabled}>
      <SelectTrigger aria-label={label} className="w-full"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="SIMPLE">Current value</SelectItem><SelectItem value="RETURN">Return</SelectItem><SelectItem value="CHANGE">Change</SelectItem></SelectContent>
    </Select>
  )
}

function OperatorSelect({ label, value, disabled, onChange }: {
  label: string
  value: ComparisonOperator
  disabled: boolean
  onChange: (value: ComparisonOperator) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => { if (isComparisonOperator(next)) onChange(next) }} disabled={disabled}>
      <SelectTrigger aria-label={label} className="w-full"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="GT">Greater than</SelectItem><SelectItem value="GTE">At least</SelectItem><SelectItem value="LT">Less than</SelectItem><SelectItem value="LTE">At most</SelectItem></SelectContent>
    </Select>
  )
}
