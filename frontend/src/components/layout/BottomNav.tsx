'use client'
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { BOTTOM_NAV, isNavActive } from './navConfig'

export const BOTTOM_NAV_HEIGHT = 64

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  // 현재 경로에 해당하는 하단 탭 (없으면 첫 탭)
  const activeValue =
    BOTTOM_NAV.find((t) => isNavActive(pathname, t.path))?.path ?? false

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <BottomNavigation
        value={activeValue}
        onChange={(_, val) => router.push(val)}
        sx={{
          height: BOTTOM_NAV_HEIGHT,
          bgcolor: 'background.paper',
          '& .MuiBottomNavigationAction-root.Mui-selected': {
            color: 'primary.main',
          },
        }}
      >
        {BOTTOM_NAV.map(({ label, icon: Icon, path }) => {
          const active = activeValue === path
          return (
            <BottomNavigationAction
              key={path}
              value={path}
              label={label}
              icon={<Icon size={22} weight={active ? 'fill' : 'regular'} />}
              sx={{ minWidth: 0, '& .MuiBottomNavigationAction-label': { fontSize: '0.6875rem' } }}
            />
          )
        })}
      </BottomNavigation>
    </Paper>
  )
}
