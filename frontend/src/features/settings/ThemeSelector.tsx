'use client'
import { Box, Typography, Stack, ButtonBase } from '@mui/material'
import { Check } from '@phosphor-icons/react'
import { useThemeStore } from '@/stores/themeStore'
import type { ThemePreset } from '@/lib/theme'

// 색상 원은 프리셋 식별용 대표색 (브랜드 고정값)
const presets: { id: ThemePreset; label: string; color: string }[] = [
  { id: 'indigo', label: '인디고', color: '#5C6BC0' },
  { id: 'green', label: '그린', color: '#41A882' },
  { id: 'pink', label: '핑크', color: '#E8789A' },
  { id: 'soda', label: '소다', color: '#5BB5B0' },
]

export function ThemeSelector() {
  const { preset, setPreset } = useThemeStore()

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        {presets.map((p) => {
          const selected = preset === p.id
          return (
            <ButtonBase
              key={p.id}
              onClick={() => setPreset(p.id)}
              sx={{
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                transition: 'border-color 0.15s',
                minWidth: 80,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {selected && <Check size={20} weight="bold" />}
              </Box>
              <Typography variant="caption" fontWeight={selected ? 700 : 500}>
                {p.label}
              </Typography>
            </ButtonBase>
          )
        })}
      </Stack>
    </Box>
  )
}
