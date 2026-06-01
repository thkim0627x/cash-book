'use client'
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Tooltip } from '@mui/material'
import { Bell, SignOut } from '@phosphor-icons/react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useToastStore } from '@/stores/toastStore'

interface HeaderProps {
  title?: string
}

export function Header({ title = '편한가계부' }: HeaderProps) {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const showToast = useToastStore((s) => s.show)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // 실패해도 로컬 정리 후 이동
    } finally {
      clearAuth()
      router.push('/login')
      showToast('로그아웃 되었습니다.', 'info')
    }
  }

  const initials = user?.name?.slice(0, 1).toUpperCase() ?? '?'

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: '64px !important' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="알림">
            <IconButton size="small">
              <Bell size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="로그아웃">
            <IconButton size="small" onClick={handleLogout}>
              <SignOut size={20} />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              ml: 0.5,
            }}
          >
            {initials}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
