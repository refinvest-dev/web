'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getSocialLoginUrl, type SocialProvider } from '@/entities/account/api/account-api'
import { Button } from '@/shared/ui/button'
import { useLocale } from '@/shared/config/locale'

const providers: Array<{ id: SocialProvider; label: string }> = [
  { id: 'kakao', label: 'Continue with Kakao' },
  { id: 'naver', label: 'Continue with Naver' },
  { id: 'google', label: 'Continue with Google' },
]

function safeReturnTo(returnTo: string | null): string {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) return '/'
  return returnTo
}

export function SocialLoginButtons({ returnTo }: { returnTo: string | null }) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)
  const { locale } = useLocale()
  const destination = safeReturnTo(returnTo)

  function startLogin(provider: SocialProvider) {
    setPendingProvider(provider)
    window.location.assign(getSocialLoginUrl(provider, destination))
  }

  return (
    <div className="grid gap-2">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          disabled={pendingProvider !== null}
          onClick={() => startLogin(provider.id)}
          type="button"
          variant="outline"
        >
          {pendingProvider === provider.id && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {locale === 'ko' ? `${provider.label.replace('Continue with ', '')}로 계속하기` : provider.label}
        </Button>
      ))}
    </div>
  )
}
