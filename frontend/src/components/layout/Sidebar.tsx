'use client'
import { usePathname, useRouter } from 'next/navigation'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material'
import { Headset } from '@phosphor-icons/react'
import { SIDEBAR_NAV_GROUPS, isNavActive } from './navConfig'

// modern_redesign_guide: 사이드바 222px, floating (radius18, shadow)
export const SIDEBAR_WIDTH = 222

// 플로팅 그림자 (가이드 §4 허용 rgba)
const SIDEBAR_SHADOW =
  '0 1px 2px rgba(14,36,56,.03), 0 6px 20px rgba(14,36,56,.05)'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    // sm+ 에서만 표시. sticky top:70 (헤더60px + 간격10px)
    <Box
      component="nav"
      sx={{
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        // sticky: 스크롤해도 뷰포트 상단에서 70px 위치 고정
        position: 'sticky',
        top: 70,
        // 높이: 콘텐츠 맞춤 (sticky가 동작하려면 높이 고정이 아닌 fit-content)
        alignSelf: 'flex-start',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider2',
        boxShadow: SIDEBAR_SHADOW,
        overflow: 'hidden',
        py: '14px',
        px: '10px',
      }}
    >
      {SIDEBAR_NAV_GROUPS.map((group, gi) => (
        <Box key={gi}>
          {/* 섹션 헤더 */}
          {group.section && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.muted',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
                px: 1.5,
                pt: gi === 0 ? 0 : 1,
                pb: 0.5,
              }}
            >
              {group.section}
            </Typography>
          )}

          <List disablePadding sx={{ mb: 0.5 }}>
            {group.items.map(({ label, icon: Icon, path, pill }) => {
              const active = isNavActive(pathname, path)
              return (
                <ListItemButton
                  key={path}
                  selected={active}
                  onClick={() => router.push(path)}
                  sx={{
                    minHeight: 40,
                    px: 1.5,
                    py: 0.5,
                    mb: 0.25,
                    borderRadius: '10px',
                    justifyContent: 'flex-start',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                    <Icon size={20} weight={active ? 'fill' : 'regular'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 500,
                      letterSpacing: '-0.012em',
                    }}
                  />
                  {pill && (
                    <Chip
                      label={pill}
                      size="small"
                      color="primary"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  )}
                </ListItemButton>
              )
            })}
          </List>
        </Box>
      ))}

      {/* 하단: 고객센터 */}
      {/* <Box
        sx={{
          mt: 'auto',
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ListItemButton
          sx={{
            minHeight: 40,
            px: 1.5,
            py: 0.5,
            borderRadius: '10px',
            color: 'text.secondary',
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <Headset size={20} />
          </ListItemIcon>
          <ListItemText
            primary="고객센터"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '-0.012em',
            }}
          />
        </ListItemButton>
      </Box> */}
    </Box>
  )
}
