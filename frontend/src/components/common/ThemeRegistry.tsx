'use client'
import { useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { buildTheme } from '@/lib/theme'
import { useThemeStore } from '@/stores/themeStore'
import queryClient from '@/lib/queryClient'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const preset = useThemeStore((s) => s.preset)
  const theme = useMemo(() => buildTheme(preset), [preset])

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
