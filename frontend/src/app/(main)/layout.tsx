'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Toolbar } from '@mui/material'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav, BOTTOM_NAV_HEIGHT } from '@/components/layout/BottomNav'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, setUser, clearAuth } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.replace('/login')
      return
    }
    // sessionStorage에 user가 이미 있으면 API 호출 생략
    if (user) return

    authService
      .me()
      .then((res) => { if (res.success) setUser(res.data) })
      .catch(() => { clearAuth(); router.replace('/login') })
    // user만 의존 — router/setUser/clearAuth는 안정적 참조
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          pb: { xs: `${BOTTOM_NAV_HEIGHT}px`, sm: 0 },
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
      <BottomNav />
    </Box>
  )
}
