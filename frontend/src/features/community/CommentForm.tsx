'use client'
import { Stack, TextField, Button, Alert, CircularProgress } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '@/services/community.service'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

interface CommentFormValues {
  content: string
}

interface CommentFormProps {
  postId: number
}

export function CommentForm({ postId }: CommentFormProps) {
  const showToast = useToastStore((s) => s.show)
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const queryClientInstance = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({ defaultValues: { content: '' } })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: CommentFormValues) =>
      communityService.createComment(postId, { content: values.content }),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'comments', postId] })
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'post', postId] })
      reset()
      showToast('댓글이 등록되었습니다.', 'success')
    },
    onError: () => showToast('댓글 등록에 실패했습니다.', 'error'),
  })

  if (!isAuthenticated) {
    return (
      <Alert
        severity="info"
        action={
          <Button size="small" color="info" onClick={() => router.push('/login')}>
            로그인
          </Button>
        }
      >
        댓글을 작성하려면 로그인이 필요합니다.
      </Alert>
    )
  }

  return (
    <Stack
      component="form"
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      onSubmit={handleSubmit((v) => mutate(v))}
    >
      <TextField
        placeholder="댓글을 입력하세요…"
        size="small"
        fullWidth
        multiline
        maxRows={4}
        error={!!errors.content}
        helperText={errors.content?.message}
        {...register('content', {
          required: '댓글 내용을 입력해주세요.',
          maxLength: { value: 500, message: '500자 이하여야 합니다.' },
        })}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isPending}
        sx={{ flexShrink: 0, mt: 0.25 }}
        startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : null}
      >
        등록
      </Button>
    </Stack>
  )
}
