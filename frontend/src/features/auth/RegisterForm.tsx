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
  Divider,
  FormControlLabel,
  Checkbox,
  Stack,
  Link,
} from '@mui/material'
import { Eye, EyeSlash, ArrowLeft } from '@phosphor-icons/react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useToastStore } from '@/stores/toastStore'

interface RegisterFormData {
  name: string
  email: string
  password: string
  passwordConfirm: string
  birthYear: string
  agreeTerms: boolean
  agreePrivacy: boolean
  agreeMarketing: boolean
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
  const [allChecked, setAllChecked] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
  })

  const password = watch('password', '')
  const agreeTerms = watch('agreeTerms')
  const agreePrivacy = watch('agreePrivacy')
  const agreeMarketing = watch('agreeMarketing')
  const pwStrength = getPasswordStrength(password)

  const handleAllCheck = (checked: boolean) => {
    setAllChecked(checked)
    setValue('agreeTerms', checked)
    setValue('agreePrivacy', checked)
    setValue('agreeMarketing', checked)
  }

  // 개별 체크 시 전체 체크 상태 동기화
  const syncAll = () => {
    setAllChecked(
      watch('agreeTerms') && watch('agreePrivacy') && watch('agreeMarketing')
    )
  }

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
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 1, p: { xs: 2, sm: 4 } }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary" fontWeight={700}>
              회원가입
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              PlanDay에 오신 것을 환영합니다
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
                    <IconButton size="small" onClick={() => setShowPwConfirm((v) => !v)} edge="end">
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
              sx={{ mb: 2.5 }}
              error={!!errors.birthYear}
              helperText={errors.birthYear?.message ?? '예: 1995'}
              {...register('birthYear', {
                required: '출생연도를 입력해주세요.',
                min: { value: 1900, message: '올바른 출생연도를 입력해주세요.' },
                max: { value: new Date().getFullYear(), message: '올바른 출생연도를 입력해주세요.' },
              })}
            />

            {/* 약관 동의 */}
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                p: 1.5,
                mb: 2.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={allChecked}
                    indeterminate={
                      (agreeTerms || agreePrivacy || agreeMarketing) && !allChecked
                    }
                    onChange={(e) => handleAllCheck(e.target.checked)}
                  />
                }
                label={<Typography variant="body2" fontWeight={600}>전체 동의</Typography>}
                sx={{ mb: 0.5 }}
              />
              <Divider sx={{ mb: 0.5 }} />

              <Stack spacing={0}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Controller
                    name="agreeTerms"
                    control={control}
                    rules={{ required: '서비스 이용약관에 동의해주세요.' }}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={field.value}
                            onChange={(e) => { field.onChange(e.target.checked); syncAll() }}
                          />
                        }
                        label={
                          <Typography variant="caption">
                            <Typography component="span" variant="caption" color="error">
                              (필수)
                            </Typography>{' '}
                            서비스 이용약관
                          </Typography>
                        }
                      />
                    )}
                  />
                  <Link href="#" variant="caption" color="text.secondary" underline="hover">
                    보기
                  </Link>
                </Stack>
                {errors.agreeTerms && (
                  <Typography variant="caption" color="error" sx={{ pl: 4 }}>
                    {errors.agreeTerms.message}
                  </Typography>
                )}

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Controller
                    name="agreePrivacy"
                    control={control}
                    rules={{ required: '개인정보 처리방침에 동의해주세요.' }}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={field.value}
                            onChange={(e) => { field.onChange(e.target.checked); syncAll() }}
                          />
                        }
                        label={
                          <Typography variant="caption">
                            <Typography component="span" variant="caption" color="error">
                              (필수)
                            </Typography>{' '}
                            개인정보 처리방침
                          </Typography>
                        }
                      />
                    )}
                  />
                  <Link href="#" variant="caption" color="text.secondary" underline="hover">
                    보기
                  </Link>
                </Stack>
                {errors.agreePrivacy && (
                  <Typography variant="caption" color="error" sx={{ pl: 4 }}>
                    {errors.agreePrivacy.message}
                  </Typography>
                )}

                <Controller
                  name="agreeMarketing"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={field.value}
                          onChange={(e) => { field.onChange(e.target.checked); syncAll() }}
                        />
                      }
                      label={
                        <Typography variant="caption">
                          <Typography component="span" variant="caption" color="text.secondary">
                            (선택)
                          </Typography>{' '}
                          마케팅 정보 수신 동의
                        </Typography>
                      }
                    />
                  )}
                />
              </Stack>
            </Box>

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
