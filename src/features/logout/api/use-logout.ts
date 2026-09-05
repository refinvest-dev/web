'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '@/entities/account/api/account-api'

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      window.location.assign('/login')
    },
  })
}
