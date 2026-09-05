'use client'

import { useSearchParams } from 'next/navigation'
import { CandlestickChart } from 'lucide-react'
import { SocialLoginButtons } from '@/features/social-login/ui/social-login-buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function LoginPage() {
  const searchParams = useSearchParams()

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CandlestickChart className="size-5" />
          </div>
          <div>
            <CardTitle>Sign in to RefInvest</CardTitle>
            <CardDescription className="mt-1">Use a supported social account to continue.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SocialLoginButtons returnTo={searchParams.get('returnTo')} />
        </CardContent>
      </Card>
    </main>
  )
}
