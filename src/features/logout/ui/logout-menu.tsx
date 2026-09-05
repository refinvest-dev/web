'use client'

import { Loader2, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SidebarMenuButton } from '@/shared/ui/sidebar'
import { useLogout } from '../api/use-logout'

export function LogoutMenu() {
  const logoutMutation = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
        <Avatar className="size-8 rounded-md">
          <AvatarFallback className="rounded-md text-xs">RI</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate text-sm font-medium">Account</span>
          <span className="truncate text-xs text-muted-foreground">Social sign-in session</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Account session</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            variant="destructive"
          >
            {logoutMutation.isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {logoutMutation.isError && (
          <p className="px-1.5 py-1 text-xs text-destructive" role="alert">
            Couldn&apos;t sign out. Please try again.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
