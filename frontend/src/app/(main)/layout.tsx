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
    // 토큰은 있으나 user 미적재(새로고침/직접진입) 시 me() 로드
    if (!user) {
      authService
        .me()
        .then((res) => {
          if (res.success) setUser(res.data)
        })
        .catch(() => {
          clearAuth()
          router.replace('/login')
        })
    }
  }, [router, user, setUser, clearAuth])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 상단 고정 헤더 (Sidebar 위에 걸침) */}
      <Header />

      {/* 좌측 사이드바 (sm+) */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          // 모바일 하단 탭바 높이만큼 여백 확보
          pb: { xs: `${BOTTOM_NAV_HEIGHT}px`, sm: 0 },
        }}
      >
        {/* fixed Header 높이만큼 밀기 */}
        <Toolbar sx={{ minHeight: '64px !important' }} />

        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>

      {/* 모바일 하단 탭바 (xs only) */}
      <BottomNav />
    </Box>
  )
}
