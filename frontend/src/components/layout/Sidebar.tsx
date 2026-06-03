'use client'
import { usePathname, useRouter } from 'next/navigation'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
} from '@mui/material'
import { Headset } from '@phosphor-icons/react'
import { SIDEBAR_NAV, isNavActive } from './navConfig'

export const SIDEBAR_WIDTH_MD = 240
export const SIDEBAR_WIDTH_SM = 72

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Drawer
      variant="permanent"
      sx={{
        // xs: 숨김 / sm: 72px / md: 240px (sx 반응형 — SSR 안전)
        display: { xs: 'none', sm: 'block' },
        width: { sm: SIDEBAR_WIDTH_SM, md: SIDEBAR_WIDTH_MD },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { sm: SIDEBAR_WIDTH_SM, md: SIDEBAR_WIDTH_MD },
          boxSizing: 'border-box',
          bgcolor: 'background.sidebar',
          borderRight: '1px solid',
          borderColor: 'divider',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header(fixed) 높이만큼 밀기 */}
      <Toolbar sx={{ minHeight: '64px !important' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 메인 메뉴 */}
        <List sx={{ p: 1.5 }}>
          {SIDEBAR_NAV.map(({ label, icon: Icon, path }) => {
            const active = isNavActive(pathname, path)
            return (
              <ListItemButton
                key={path}
                selected={active}
                onClick={() => router.push(path)}
                sx={{
                  mb: 0.5,
                  minHeight: 44,
                  px: { sm: 0, md: 1.5 },
                  justifyContent: { sm: 'center', md: 'flex-start' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: { sm: 0, md: 36 },
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  <Icon size={22} weight={active ? 'fill' : 'regular'} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  sx={{
                    display: { sm: 'none', md: 'block' },
                    '& .MuiTypography-root': {
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 500,
                    },
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>

        {/* 하단: 고객센터 */}
        <Box sx={{ mt: 'auto', p: 1.5 }}>
          <ListItemButton
            sx={{
              minHeight: 44,
              px: { sm: 0, md: 1.5 },
              justifyContent: { sm: 'center', md: 'flex-start' },
              color: 'text.secondary',
            }}
          >
            <ListItemIcon
              sx={{ minWidth: { sm: 0, md: 36 }, justifyContent: 'center', color: 'inherit' }}
            >
              <Headset size={22} />
            </ListItemIcon>
            <ListItemText
              primary="고객센터"
              sx={{
                display: { sm: 'none', md: 'block' },
                '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 500 },
              }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  )
}
