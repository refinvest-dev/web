'use client'

import { useSearchParams } from 'next/navigation'
import { CandlestickChart } from 'lucide-react'
import { SocialLoginButtons } from '@/features/social-login/ui/social-login-buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useLocale } from '@/shared/config/locale'
import { LanguageSelector } from '@/widgets/app-shell/ui/language-selector'

export function LoginPage() {
  const searchParams = useSearchParams()
  const { locale } = useLocale()

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 right-4 w-32">
        <LanguageSelector />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CandlestickChart className="size-5" />
          </div>
          <div>
            <CardTitle>{locale === 'ko' ? 'RefInvest에 로그인' : 'Sign in to RefInvest'}</CardTitle>
            <CardDescription className="mt-1">
              {locale === 'ko'
                ? '지원되는 소셜 계정으로 계속하세요.'
                : 'Use a supported social account to continue.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SocialLoginButtons returnTo={searchParams.get('returnTo')} />
        </CardContent>
      </Card>
    </main>
  )
}
