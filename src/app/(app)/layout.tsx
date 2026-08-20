import { AppSidebar } from '@/widgets/app-shell/ui/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
