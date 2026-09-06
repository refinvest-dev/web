'use client'

import { Languages } from 'lucide-react'
import { useLocale, type Locale } from '@/shared/config/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'
import { SidebarMenuButton } from '@/shared/ui/sidebar'

const languageNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
}

export function LanguageSelector({ sidebar = false }: { sidebar?: boolean }) {
  const { locale, setLocale } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={locale === 'ko' ? '언어 선택' : 'Select language'}
        render={
          sidebar ? (
            <SidebarMenuButton tooltip={locale === 'ko' ? '언어' : 'Language'} />
          ) : (
            <Button variant="ghost" className="w-full justify-start" />
          )
        }
      >
        <Languages />
        <span>{languageNames[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        <DropdownMenuLabel>{locale === 'ko' ? '언어' : 'Language'}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            if (value === 'en' || value === 'ko') setLocale(value)
          }}
        >
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ko">한국어</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
