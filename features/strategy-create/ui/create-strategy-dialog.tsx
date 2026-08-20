'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ApiError } from '@/lib/api/http'
import { useCreateStrategy } from '../api/use-create-strategy'

const NAME_MAX = 200

export function CreateStrategyDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [attempted, setAttempted] = useState(false)

  const { mutate, isPending, error, reset } = useCreateStrategy({
    onCreated: (created) => {
      setOpen(false)
      router.push(`/strategies/${created.id}`)
    },
  })

  const trimmed = name.trim()
  const validationMessage =
    trimmed.length < 1
      ? 'Enter a name for the strategy.'
      : trimmed.length > NAME_MAX
        ? `Name must be ${NAME_MAX} characters or fewer.`
        : null
  const showValidationError = attempted && validationMessage

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Reset transient form + mutation state when the dialog closes.
      setName('')
      setAttempted(false)
      reset()
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    if (validationMessage) return
    mutate({ name: trimmed })
  }

  const apiErrorMessage =
    error instanceof ApiError
      ? error.message
      : error
        ? 'Could not create the strategy. Please try again.'
        : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus data-icon="inline-start" />
        New Strategy
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New strategy</DialogTitle>
          <DialogDescription>
            Give your strategy a name. You can define its signal conditions and
            run backtests afterward.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={showValidationError ? true : undefined}>
              <FieldLabel htmlFor="strategy-name">Name</FieldLabel>
              <Input
                id="strategy-name"
                value={name}
                autoFocus
                maxLength={NAME_MAX}
                placeholder="e.g. QQQ Momentum Regime"
                disabled={isPending}
                aria-invalid={showValidationError ? true : undefined}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  // Don't submit while a CJK IME is composing.
                  if (
                    e.key === 'Enter' &&
                    (e.nativeEvent.isComposing || e.keyCode === 229)
                  ) {
                    e.preventDefault()
                  }
                }}
              />
              {showValidationError ? (
                <FieldError>{validationMessage}</FieldError>
              ) : (
                <FieldDescription>
                  {trimmed.length}/{NAME_MAX} characters
                </FieldDescription>
              )}
            </Field>

            {apiErrorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t create strategy</AlertTitle>
                <AlertDescription>{apiErrorMessage}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending || !trimmed}>
              {isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isPending ? 'Creating…' : 'Create strategy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
