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
  InputAdornment,
  IconButton,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import { Eye, EyeSlash, ArrowLeft } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useToastStore } from '@/stores/toastStore'

interface RegisterFormData {
  name: string
  email: string
  password: string
  passwordConfirm: string
  birthYear: string
}

function getPasswordStrength(pw: string): number {
  let score = 0
  if (pw.length >= 8) score += 25
  if (/[A-Z]/.test(pw)) score += 25
  if (/[0-9]/.test(pw)) score += 25
  if (/[^A-Za-z0-9]/.test(pw)) score += 25
  return score
}

function getStrengthColor(score: number): 'error' | 'warning' | 'success' {
  if (score < 50) return 'error'
  if (score < 75) return 'warning'
  return 'success'
}

export function RegisterForm() {
  const router = useRouter()
  const showToast = useToastStore((s) => s.show)
  const [showPw, setShowPw] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch('password', '')
  const pwStrength = getPasswordStrength(password)

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        birthYear: Number(data.birthYear),
      })
      if (res.success) {
        showToast('회원가입이 완료되었습니다. 로그인해주세요.', 'success')
        router.push('/login')
      } else {
        setServerError(res.message || '회원가입에 실패했습니다.')
      }
    } catch (e: unknown) {
      const axiosError = e as { response?: { data?: { message?: string } } }
      setServerError(axiosError.response?.data?.message || '회원가입 중 오류가 발생했습니다.')
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
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4, p: { xs: 2, sm: 4 } }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary" fontWeight={700}>
              회원가입
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              편한가계부에 오신 것을 환영합니다
            </Typography>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="이름(닉네임)"
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', {
                required: '이름을 입력해주세요.',
                maxLength: { value: 20, message: '이름은 20자 이하여야 합니다.' },
              })}
            />

            <TextField
              label="이메일"
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: { value: /\S+@\S+\.\S+/, message: '올바른 이메일 형식이 아닙니다.' },
              })}
            />

            <TextField
              label="비밀번호"
              type={showPw ? 'text' : 'password'}
              fullWidth
              sx={{ mb: 0.5 }}
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
                minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
              })}
            />
            {password && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={pwStrength}
                  color={getStrengthColor(pwStrength)}
                  sx={{ height: 4, borderRadius: 2 }}
                />
                <Typography variant="caption" color={`${getStrengthColor(pwStrength)}.main`}>
                  {pwStrength < 50 ? '약함' : pwStrength < 75 ? '보통' : '강함'}
                </Typography>
              </Box>
            )}

            <TextField
              label="비밀번호 확인"
              type={showPwConfirm ? 'text' : 'password'}
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.passwordConfirm}
              helperText={errors.passwordConfirm?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPwConfirm((v) => !v)}
                      edge="end"
                    >
                      {showPwConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('passwordConfirm', {
                required: '비밀번호 확인을 입력해주세요.',
                validate: (val) => val === password || '비밀번호가 일치하지 않습니다.',
              })}
            />

            <TextField
              label="출생연도"
              fullWidth
              type="number"
              sx={{ mb: 3 }}
              error={!!errors.birthYear}
              helperText={errors.birthYear?.message ?? '예: 1995'}
              {...register('birthYear', {
                required: '출생연도를 입력해주세요.',
                min: { value: 1900, message: '올바른 출생연도를 입력해주세요.' },
                max: {
                  value: new Date().getFullYear(),
                  message: '올바른 출생연도를 입력해주세요.',
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
              {loading ? <CircularProgress size={22} color="inherit" /> : '가입하기'}
            </Button>

            <Button
              variant="text"
              fullWidth
              startIcon={<ArrowLeft size={16} />}
              onClick={() => router.push('/login')}
              color="inherit"
              sx={{ color: 'text.secondary' }}
            >
              로그인으로 돌아가기
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
