'use client'
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest } from '@/types/auth'
import NextLink from 'next/link'
import { SocialLoginButtons } from './SocialLoginButtons'

const SAVED_EMAIL_KEY = 'savedEmail'
const LAST_LOGIN_KEY = 'lastLoginMethod'

export function LoginForm() {
  const router = useRouter()
  const { setAuth, setUser } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(false)
  const [autoLogin, setAutoLogin] = useState(true)
  const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>()

  // 저장된 이메일 + 마지막 로그인 방법 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY)
    if (saved) {
      setValue('email', saved)
      setRememberEmail(true)
    }
    setLastLoginMethod(localStorage.getItem(LAST_LOGIN_KEY))
  }, [setValue])

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await authService.login(data)
      if (res.success) {
        // 아이디 저장 처리
        if (rememberEmail) {
          localStorage.setItem(SAVED_EMAIL_KEY, data.email)
        } else {
          localStorage.removeItem(SAVED_EMAIL_KEY)
        }
        // 최근 로그인 방법 저장
        localStorage.setItem(LAST_LOGIN_KEY, 'email')

        setAuth(
          {
            id: 0,
            email: data.email,
            name: data.email.split('@')[0],
            birthYear: null,
            role: 'USER',
          },
          res.data.accessToken,
          res.data.refreshToken,
          autoLogin
        )
        try {
          const meRes = await authService.me()
          if (meRes.success) setUser(meRes.data)
        } catch {
          // me 실패해도 로그인 처리
        }
        router.push('/dashboard')
      } else {
        setServerError(res.message || '로그인에 실패했습니다.')
      }
    } catch (e: unknown) {
      const axiosError = e as { response?: { data?: { message?: string } } }
      setServerError(
        axiosError.response?.data?.message || '로그인 중 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isEmailLastLogin = lastLoginMethod === 'email'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 4,
          p: { xs: 2, sm: 4 },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* 로고 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" color="primary" fontWeight={700}>
              PlanDay
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              스마트한 가계부 관리를 시작하세요
            </Typography>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="이메일"
              fullWidth
              autoComplete="email"
              sx={{ mb: 2 }}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: '올바른 이메일 형식이 아닙니다.',
                },
              })}
            />

            <TextField
              label="비밀번호"
              type={showPw ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              sx={{ mb: 1.5 }}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw((v) => !v)} edge="end">
                      {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password', {
                required: '비밀번호를 입력해주세요.',
                minLength: { value: 6, message: '비밀번호는 6자 이상이어야 합니다.' },
              })}
            />

            {/* 아이디 저장 + 자동 로그인 */}
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">아이디 저장</Typography>}
                sx={{ mr: 0 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={autoLogin}
                    onChange={(e) => setAutoLogin(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">자동 로그인</Typography>}
                sx={{ mr: 0 }}
              />
            </Stack>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2, position: 'relative' }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : '로그인'}
              {isEmailLastLogin && (
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: 8,
                    bgcolor: 'success.main',
                    color: 'white',
                    borderRadius: 10,
                    px: 0.8,
                    py: 0.1,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  최근
                </Box>
              )}
            </Button>

            {/* 간편 로그인 */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                간편 로그인
              </Typography>
            </Divider>

            <SocialLoginButtons lastLoginMethod={lastLoginMethod} mode="login" />

            {/* 하단 링크 */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 3 }}
            >
              <Link
                href="#"
                variant="body2"
                color="text.secondary"
                underline="hover"
              >
                비밀번호 찾기
              </Link>
              <Button
                variant="outlined"
                size="small"
                component={NextLink}
                href="/register"
              >
                회원가입
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
