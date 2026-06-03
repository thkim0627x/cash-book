'use client'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { communityService } from '@/services/community.service'
import { PostForm } from '@/features/community/PostForm'
import { useToastStore } from '@/stores/toastStore'
import type { PostCreateRequest } from '@/types/community'

export default function CommunityWritePage() {
  const router = useRouter()
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PostCreateRequest) => communityService.create(data),
    onSuccess: (res) => {
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'list'] })
      showToast('게시글이 등록되었습니다.', 'success')
      router.push(`/community/${res.data.id}`)
    },
    onError: () => showToast('게시글 등록에 실패했습니다.', 'error'),
  })

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        글 작성
      </Typography>
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <PostForm
            onSubmit={mutate}
            onCancel={() => router.push('/community')}
            isPending={isPending}
            submitLabel="등록"
          />
        </CardContent>
      </Card>
    </Box>
  )
}
