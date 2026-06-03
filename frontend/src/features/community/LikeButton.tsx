'use client'
import { Button, CircularProgress } from '@mui/material'
import { Heart } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '@/services/community.service'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: number
  liked: boolean
  likeCount: number
  disabled?: boolean // 본인 글일 때 비활성
}

export function LikeButton({ postId, liked, likeCount, disabled }: LikeButtonProps) {
  const showToast = useToastStore((s) => s.show)
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const queryClientInstance = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => communityService.toggleLike(postId),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'post', postId] })
    },
    onError: () => showToast('좋아요 처리에 실패했습니다.', 'error'),
  })

  const handleClick = () => {
    if (!isAuthenticated) {
      showToast('로그인이 필요합니다.', 'info')
      router.push('/login')
      return
    }
    mutate()
  }

  return (
    <Button
      variant={liked ? 'contained' : 'outlined'}
      color={liked ? 'error' : 'inherit'}
      size="small"
      disabled={disabled || isPending}
      onClick={handleClick}
      startIcon={
        isPending ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          <Heart size={16} weight={liked ? 'fill' : 'regular'} />
        )
      }
      sx={{ borderColor: 'divider' }}
    >
      {likeCount.toLocaleString('ko-KR')}
    </Button>
  )
}
