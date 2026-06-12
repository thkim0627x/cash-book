'use client'
import { authService } from '@/services/auth.service'
import { notificationService } from '@/services/notification.service'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { Bell, CaretDown, Gear, SignOut } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Logo } from './Logo'

// modern_redesign_guide: 헤더 60px, position sticky, 캔버스 배경
export const HEADER_HEIGHT = 60

export function Header() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const showToast = useToastStore((s) => s.show)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // 미읽음 알림 수 — 30초 폴링 (로그인 상태에서만)
  const { data: unreadRes } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30_000,
    enabled: isAuthenticated,
  })
  const unreadCount = unreadRes?.data?.count ?? 0

  const handleLogout = async () => {
    setAnchorEl(null)
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
    // position="sticky": 헤더가 1400px 프레임 내부에 자연스럽게 포함됨
    // 스크롤 시 뷰포트 상단에 고정 (fixed와 달리 레이아웃 흐름에 포함)
    <AppBar
      position="sticky"
      sx={{
        // bgcolor은 MuiAppBar 오버라이드(background.default)에서 처리
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: `${HEADER_HEIGHT}px !important`,
          px: { xs: 1.5, sm: 2, md: 2.5 },
          gap: { xs: 1, md: 1.5 },
        }}
      >
        {/* 로고 */}
        <Logo />

        <Box sx={{ flexGrow: 1 }} />

        {/* 검색 (sm+) — bg: background.paper 로 캔버스 위에 부유 */}
        {/* <TextField
          placeholder="검색 (거래내역, 태그, 메모)"
          size="small"
          sx={{
            width: { sm: 200, md: 260 },
            display: { xs: 'none', sm: 'block' },
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlass size={15} />
                </InputAdornment>
              ),
            },
          }}
        /> */}

        {/* 알림 아이콘 */}
        <Tooltip title="알림">
          <IconButton
            size="small"
            onClick={() => router.push('/notifications')}
            sx={{ color: 'text.secondary', mr: -1.5 }}
          >
            <Badge
              badgeContent={unreadCount > 0 ? unreadCount : null}
              color="error"
              max={99}
            >
              <Bell size={20} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* 아바타 + 이름 */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            ml: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: '10px',
            transition: 'background 0.15s',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: 'primary.main',
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              display: { xs: 'none', sm: 'block' },
              letterSpacing: '-0.012em',
            }}
          >
            {user?.name ?? '사용자'}
          </Typography>
          <CaretDown size={13} />
        </Box>

        {/* 아바타 드롭다운 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 180 } } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">
              {user?.name ?? '사용자'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email ?? ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              router.push('/settings')
            }}
          >
            <ListItemIcon>
              <Gear size={18} />
            </ListItemIcon>
            설정
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <SignOut size={18} />
            </ListItemIcon>
            로그아웃
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
