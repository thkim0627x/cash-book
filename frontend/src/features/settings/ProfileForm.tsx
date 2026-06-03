'use client'
import { useEffect } from 'react'
import {
  Stack,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

interface ProfileFormValues {
  name: string
  birthYear: string
}

export function ProfileForm() {
  const { user, setUser } = useAuthStore()
  const showToast = useToastStore((s) => s.show)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: { name: '', birthYear: '' },
  })

  // user 로드 시 폼 채우기
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        birthYear: user.birthYear != null ? String(user.birthYear) : '',
      })
    }
  }, [user, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      userService.updateProfile({
        name: values.name,
        birthYear: values.birthYear ? Number(values.birthYear) : null,
      }),
    onSuccess: (res) => {
      if (res.success) {
        setUser(res.data)
        reset({
          name: res.data.name,
          birthYear: res.data.birthYear != null ? String(res.data.birthYear) : '',
        })
        showToast('프로필이 수정되었습니다.', 'success')
      }
    },
    onError: () => showToast('프로필 수정에 실패했습니다.', 'error'),
  })

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit((v) => mutate(v))}
      spacing={2.5}
      sx={{ maxWidth: 420 }}
    >
      {/* 이메일 (수정 불가) */}
      <TextField
        label="이메일"
        value={user?.email ?? ''}
        disabled
        fullWidth
        helperText="이메일은 변경할 수 없습니다."
      />

      {/* 닉네임 */}
      <TextField
        label="닉네임"
        fullWidth
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register('name', {
          required: '닉네임을 입력해주세요.',
          maxLength: { value: 20, message: '닉네임은 20자 이하여야 합니다.' },
        })}
      />

      {/* 출생연도 */}
      <TextField
        label="출생연도"
        type="number"
        fullWidth
        error={!!errors.birthYear}
        helperText={errors.birthYear?.message ?? '예: 1998'}
        InputProps={{ endAdornment: <InputAdornment position="end">년</InputAdornment> }}
        {...register('birthYear', {
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
        disabled={isPending || !isDirty}
        sx={{ alignSelf: 'flex-start' }}
        startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
      >
        프로필 저장
      </Button>
    </Stack>
  )
}
