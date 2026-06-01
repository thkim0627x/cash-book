'use client'
import { usePathname, useRouter } from 'next/navigation'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  House,
  Receipt,
  CalendarBlank,
  Wallet,
  ChartBar,
  Tag,
  Gear,
  Gift,
} from '@phosphor-icons/react'

const DRAWER_WIDTH = 240
const DRAWER_MINI = 64

const navItems = [
  { label: '대시보드', icon: House, path: '/dashboard' },
  { label: '거래 내역', icon: Receipt, path: '/transactions' },
  { label: '달력', icon: CalendarBlank, path: '/calendar' },
  { label: '예산', icon: Wallet, path: '/budget' },
  { label: '통계', icon: ChartBar, path: '/statistics' },
  { label: '청년 혜택', icon: Gift, path: '/benefits' },
  { label: '카테고리', icon: Tag, path: '/categories' },
  { label: '설정', icon: Gear, path: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))

  if (!isSm) return null // xs: 사이드바 숨김

  const mini = !isMd
  const width = mini ? DRAWER_MINI : DRAWER_WIDTH

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'background.paper',
          overflowX: 'hidden',
          transition: 'width 0.2s',
        },
      }}
    >
      <Toolbar sx={{ px: 2, minHeight: '64px !important' }}>
        {!mini && (
          <Typography
            variant="h6"
            color="primary"
            fontWeight={700}
            sx={{ cursor: 'pointer' }}
            onClick={() => router.push('/dashboard')}
          >
            편한가계부
          </Typography>
        )}
      </Toolbar>

      <List sx={{ px: 1, pt: 0 }}>
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = pathname === path || pathname.startsWith(path + '/')
          return (
            <ListItemButton
              key={path}
              onClick={() => router.push(path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                minHeight: 44,
                px: mini ? 1.5 : 2,
                justifyContent: mini ? 'center' : 'flex-start',
                bgcolor: active ? 'primary.light' : 'transparent',
                color: active ? 'primary.dark' : 'text.secondary',
                borderLeft: active ? '4px solid' : '4px solid transparent',
                borderColor: active ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: mini ? 0 : 36,
                  color: 'inherit',
                  justifyContent: 'center',
                }}
              >
                <Icon size={22} weight={active ? 'bold' : 'regular'} />
              </ListItemIcon>
              {!mini && (
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
                />
              )}
            </ListItemButton>
          )
        })}
      </List>
    </Drawer>
  )
}
