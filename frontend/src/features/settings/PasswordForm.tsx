'use client'
import { useState } from 'react'
import {
  Stack,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { useToastStore } from '@/stores/toastStore'

interface PasswordFormValues {
  currentPassword: string
  newPassword: string
  newPasswordConfirm: string
}

export function PasswordForm() {
  const showToast = useToastStore((s) => s.show)
  const [showPw, setShowPw] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    defaultValues: { currentPassword: '', newPassword: '', newPasswordConfirm: '' },
  })

  const newPassword = watch('newPassword', '')

  const { mutate, isPending } = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: (res) => {
      if (res.success) {
        reset()
        showToast('비밀번호가 변경되었습니다.', 'success')
      }
    },
    onError: (e: unknown) => {
      const axiosError = e as { response?: { data?: { message?: string } } }
      showToast(
        axiosError.response?.data?.message ?? '비밀번호 변경에 실패했습니다.',
        'error'
      )
    },
  })

  const pwToggle = (
    <InputAdornment position="end">
      <IconButton size="small" onClick={() => setShowPw((v) => !v)} edge="end">
        {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
      </IconButton>
    </InputAdornment>
  )

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit((v) => mutate(v))}
      spacing={2.5}
      sx={{ maxWidth: 420 }}
    >
      <TextField
        label="현재 비밀번호"
        type={showPw ? 'text' : 'password'}
        fullWidth
        autoComplete="current-password"
        error={!!errors.currentPassword}
        helperText={errors.currentPassword?.message}
        InputProps={{ endAdornment: pwToggle }}
        {...register('currentPassword', { required: '현재 비밀번호를 입력해주세요.' })}
      />

      <TextField
        label="새 비밀번호"
        type={showPw ? 'text' : 'password'}
        fullWidth
        autoComplete="new-password"
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message}
        InputProps={{ endAdornment: pwToggle }}
        {...register('newPassword', {
          required: '새 비밀번호를 입력해주세요.',
          minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
        })}
      />

      <TextField
        label="새 비밀번호 확인"
        type={showPw ? 'text' : 'password'}
        fullWidth
        autoComplete="new-password"
        error={!!errors.newPasswordConfirm}
        helperText={errors.newPasswordConfirm?.message}
        InputProps={{ endAdornment: pwToggle }}
        {...register('newPasswordConfirm', {
          required: '비밀번호 확인을 입력해주세요.',
          validate: (val) => val === newPassword || '비밀번호가 일치하지 않습니다.',
        })}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isPending}
        sx={{ alignSelf: 'flex-start' }}
        startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
      >
        비밀번호 변경
      </Button>
    </Stack>
  )
}
