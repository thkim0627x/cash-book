'use client'
import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
} from '@mui/material'
import { Bell, MagnifyingGlass, SignOut, Gear, CaretDown } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { useToastStore } from '@/stores/toastStore'
import { Logo } from './Logo'

export const HEADER_HEIGHT = 64

export function Header() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const showToast = useToastStore((s) => s.show)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

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
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, md: 2 }, minHeight: `${HEADER_HEIGHT}px !important` }}>
        {/* 로고 — 클릭 시 /dashboard (Logo 내부 처리) */}
        <Logo />

        <Box sx={{ flexGrow: 1 }} />

        {/* 검색 (sm+) */}
        <TextField
          placeholder="검색 (거래내역, 태그, 메모)"
          size="small"
          sx={{
            width: { sm: 220, md: 280 },
            display: { xs: 'none', sm: 'block' },
            '& .MuiOutlinedInput-root': { bgcolor: 'background.default' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass size={16} />
              </InputAdornment>
            ),
          }}
        />

        {/* 알림 */}
        <Tooltip title="알림">
          <IconButton size="small">
            <Badge badgeContent={3} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* 아바타 + 이름 */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', ml: 0.5 }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {user?.name ?? '사용자'}
          </Typography>
          <CaretDown size={14} />
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
            <Typography variant="subtitle2">{user?.name ?? '사용자'}</Typography>
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
