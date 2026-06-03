'use client'
import { useState } from 'react'
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
} from '@mui/material'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest } from '@/types/auth'
import NextLink from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const { setAuth, setUser } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await authService.login(data)
      if (res.success) {
        // 토큰 우선 저장 (임시 user) → 곧바로 me()로 정확한 정보 교체
        setAuth(
          {
            id: 0,
            email: data.email,
            name: data.email.split('@')[0],
            birthYear: null,
            role: 'USER',
          },
          res.data.accessToken,
          res.data.refreshToken
        )
        // 로그인 직후 실제 사용자 정보 로드
        try {
          const meRes = await authService.me()
          if (meRes.success) setUser(meRes.data)
        } catch {
          // me 실패해도 로그인 자체는 성공 처리 (대시보드 진입)
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
          {/* 로고 영역 */}
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
              sx={{ mb: 3 }}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPw((v) => !v)}
                      edge="end"
                    >
                      {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password', {
                required: '비밀번호를 입력해주세요.',
                minLength: {
                  value: 6,
                  message: '비밀번호는 6자 이상이어야 합니다.',
                },
              })}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                '로그인'
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                또는
              </Typography>
            </Divider>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              component={NextLink}
              href="/register"
            >
              회원가입
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                href="#"
                variant="body2"
                color="text.secondary"
                underline="hover"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
