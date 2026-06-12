'use client'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { useToastStore } from '@/stores/toastStore'

export type SocialProvider = 'kakao' | 'naver' | 'google' | 'apple'

const SOCIAL_CONFIG: Record<
  SocialProvider,
  {
    label: string
    bg: string
    color: string
    border?: string
    logo: React.ReactNode
  }
> = {
  kakao: {
    label: '카카오',
    bg: '#FEE500',
    color: '#3C1E1E',
    logo: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.1 1.3 3.95 3.27 5.04l-.83 3.07 3.57-2.36c.48.07.97.1 1.49.1 4.14 0 7.5-2.69 7.5-6s-3.36-6-7.5-6z"
          fill="#3C1E1E"
        />
      </svg>
    ),
  },
  naver: {
    label: '네이버',
    bg: '#03C75A',
    color: '#ffffff',
    logo: (
      <Typography
        component="span"
        fontWeight={800}
        fontSize={15}
        lineHeight={1}
        color="#ffffff"
      >
        N
      </Typography>
    ),
  },
  google: {
    label: 'Google',
    bg: '#ffffff',
    color: '#3c4043',
    border: '#dadce0',
    logo: (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.167 6.656 3.58 9 3.58z"
        />
      </svg>
    ),
  },
  apple: {
    label: 'Apple',
    bg: '#000000',
    color: '#ffffff',
    logo: (
      <svg width="16" height="18" viewBox="0 0 814 1000" fill="#ffffff">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.5 714.8 0 617.3 0 523.8c0-155.4 101.2-237.5 200.1-237.5 52.6 0 96.5 34.5 128.4 34.5 30.4 0 78.4-36.9 140.8-36.9 17.9 0 108.3 1.9 163.7 67.3zm-202.5-71.7c14.2-17.5 21.6-41.5 21.6-65.5 0-31.2-11.6-64.8-34.3-90.9-20.7-24-53-42.4-82.5-42.4-3.2 0-6.4.3-9.6.6-1 25.3 8.3 55.7 26.9 79.9 18.5 24 52.2 44 77.9 48.3z" />
      </svg>
    ),
  },
}

interface Props {
  lastLoginMethod?: string | null
  mode?: 'login' | 'register'
}

export function SocialLoginButtons({ lastLoginMethod, mode = 'login' }: Props) {
  const showToast = useToastStore((s) => s.show)

  const handleSocial = (provider: SocialProvider) => {
    showToast(
      `${SOCIAL_CONFIG[provider].label} ${mode === 'login' ? '로그인' : '간편가입'}은 준비 중입니다.`,
      'info'
    )
  }

  const providers: SocialProvider[] = ['kakao', 'naver', 'google', 'apple']

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5}>
        {providers.slice(0, 2).map((provider) => (
          <SocialButton
            key={provider}
            provider={provider}
            isRecent={lastLoginMethod === provider}
            mode={mode}
            onClick={() => handleSocial(provider)}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1.5}>
        {providers.slice(2).map((provider) => (
          <SocialButton
            key={provider}
            provider={provider}
            isRecent={lastLoginMethod === provider}
            mode={mode}
            onClick={() => handleSocial(provider)}
          />
        ))}
      </Stack>
    </Stack>
  )
}

function SocialButton({
  provider,
  isRecent,
  mode,
  onClick,
}: {
  provider: SocialProvider
  isRecent: boolean
  mode: 'login' | 'register'
  onClick: () => void
}) {
  const cfg = SOCIAL_CONFIG[provider]
  const label = `${cfg.label} ${mode === 'login' ? '로그인' : '가입'}`

  return (
    <Box sx={{ flex: 1, position: 'relative' }}>
      <Button
        fullWidth
        onClick={onClick}
        sx={{
          bgcolor: cfg.bg,
          color: cfg.color,
          border: cfg.border ? `1px solid ${cfg.border}` : 'none',
          py: 1.1,
          fontWeight: 600,
          fontSize: '0.8rem',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          '&:hover': {
            bgcolor: cfg.bg,
            opacity: 0.88,
            border: cfg.border ? `1px solid ${cfg.border}` : 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {cfg.logo}
        </Box>
        {label}
      </Button>

      {isRecent && (
        <Chip
          label="최근"
          size="small"
          color="primary"
          sx={{
            position: 'absolute',
            top: -8,
            right: 6,
            height: 18,
            fontSize: '0.6rem',
            fontWeight: 700,
            zIndex: 1,
          }}
        />
      )}
    </Box>
  )
}
