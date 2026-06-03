'use client'
import { Box, Typography } from '@mui/material'
import { CalendarCheck } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

interface LogoProps {
  /** 아이콘만 표시 (사이드바 mini 모드 등) */
  iconOnly?: boolean
}

export function Logo({ iconOnly = false }: LogoProps) {
  const router = useRouter()

  return (
    <Box
      onClick={() => router.push('/dashboard')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <CalendarCheck size={20} weight="fill" />
      </Box>
      {!iconOnly && (
        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
          PlanDay
        </Typography>
      )}
    </Box>
  )
}
