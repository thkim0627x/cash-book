'use client'
import { BOTTOM_NAV_HEIGHT, BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar, SIDEBAR_WIDTH } from '@/components/layout/Sidebar'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, setUser, clearAuth } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.replace('/login')
      return
    }
    if (user) return

    authService
      .me()
      .then((res) => {
        if (res.success) setUser(res.data)
      })
      .catch(() => {
        clearAuth()
        router.replace('/login')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    // 외곽 전체: 캔버스 단일 색상 (background.default = #EAF1F7)
    // 1400px 초과 시 캔버스 색이 양쪽으로 자연스럽게 노출 (OuterFrame 개념 제거)
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* 1400px 중앙 정렬 프레임 */}
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* 헤더: sticky (position="sticky") — 레이아웃 흐름 포함, pt 오프셋 불필요 */}
        <Header />

        {/* 바디 행: 사이드바 + 메인 콘텐츠 */}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            // modern_redesign_guide: body gap 48px, padding 2px 18px 18px
            gap: { xs: 0, sm: '24px', lg: '40px' },
            p: { xs: '0 0 0', sm: '2px 12px 12px', md: '2px 18px 18px' },
            alignItems: 'flex-start',
          }}
        >
          {/* 사이드바 (sm+ sticky) — Sidebar 내부에서 display:none xs 처리 */}
          <Sidebar />

          {/* 메인 콘텐츠 */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              // 모바일: BottomNav 높이만큼 하단 패딩
              pb: { xs: `${BOTTOM_NAV_HEIGHT + 16}px`, sm: '24px' },
              pl: { xs: 1.75, sm: 0 },
              pr: { xs: 1.75 },
              // 사이드바 없는 xs: 전체 너비
              width: {
                xs: '100%',
                sm: `calc(100% - ${SIDEBAR_WIDTH}px - 24px)`,
              },
            }}
          >
            {children}
          </Box>
        </Box>

        <BottomNav />
      </Box>
    </Box>
  )
}
