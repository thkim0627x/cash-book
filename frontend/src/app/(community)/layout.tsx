'use client'
import { useEffect } from 'react'
import { Box, Toolbar } from '@mui/material'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav, BOTTOM_NAV_HEIGHT } from '@/components/layout/BottomNav'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'

/**
 * 비로그인 읽기를 허용하는 레이아웃.
 * auth 리다이렉트 없음 — 토큰 있으면 user 로드만 시도.
 */
export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token && !user) {
      authService
        .me()
        .then((res) => { if (res.success) setUser(res.data) })
        .catch(() => { /* 토큰 만료 등 — 조용히 처리 */ })
    }
  }, [user, setUser])

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
