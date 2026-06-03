'use client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Pagination,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material'
import { PencilSimple, ArrowUp, Clock } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { communityService } from '@/services/community.service'
import { PostCard } from '@/features/community/PostCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuthStore } from '@/stores/authStore'
import type { PostCategory } from '@/types/community'

type TabValue = 'ALL' | PostCategory

const TABS: { value: TabValue; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'BENEFIT_REVIEW', label: '혜택후기' },
  { value: 'SAVING_TIP', label: '절약팁' },
  { value: 'QA', label: 'Q&A' },
  { value: 'FREE', label: '자유' },
]

const PAGE_SIZE = 20

export default function CommunityPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [tab, setTab] = useState<TabValue>('ALL')
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')
  const [page, setPage] = useState(1)

  const { data: postsRes, isLoading, isError } = useQuery({
    queryKey: ['community', 'list', tab, sort, page],
    queryFn: () =>
      communityService.getList({
        category: tab === 'ALL' ? undefined : tab,
        sort,
        page: page - 1,
        size: PAGE_SIZE,
      }),
  })

  const posts = postsRes?.data?.content ?? []
  const totalPages = postsRes?.data?.totalPages ?? 1
  const totalElements = postsRes?.data?.totalElements ?? 0

  // 고정 게시글 분리
  const pinnedPosts = posts.filter((p) => p.isPinned)
  const normalPosts = posts.filter((p) => !p.isPinned)

  const handleTabChange = (_: React.SyntheticEvent, val: TabValue) => {
    setTab(val)
    setPage(1)
  }

  return (
    <Box>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            커뮤니티
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            청년들의 혜택 후기, 절약 팁, 질문을 나눠요
          </Typography>
        </Box>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<PencilSimple size={16} />}
            onClick={() => router.push('/community/write')}
          >
            글쓰기
          </Button>
        )}
      </Stack>

      {/* 비로그인 안내 */}
      {!isAuthenticated && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button size="small" color="info" onClick={() => router.push('/login')}>
              로그인
            </Button>
          }
        >
          로그인하면 글쓰기, 좋아요, 댓글 작성이 가능합니다.
        </Alert>
      )}

      {/* 카테고리 탭 + 정렬 */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 2.5 }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '2px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, minHeight: 40 },
          }}
        >
          {TABS.map(({ value, label }) => (
            <Tab key={value} value={value} label={label} />
          ))}
        </Tabs>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={sort}
          onChange={(_, val) => val && (setSort(val), setPage(1))}
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="latest" sx={{ fontWeight: 600, px: 2 }}>
            <Clock size={14} style={{ marginRight: 4 }} />
            최신
          </ToggleButton>
          <ToggleButton value="popular" sx={{ fontWeight: 600, px: 2 }}>
            <ArrowUp size={14} style={{ marginRight: 4 }} />
            인기
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* 결과 수 */}
      {!isLoading && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          총 <strong>{totalElements.toLocaleString('ko-KR')}</strong>개의 게시글
        </Typography>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          게시글을 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* 게시글 목록 */}
      {isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Stack>
      ) : posts.length === 0 ? (
        <EmptyState
          message="게시글이 없습니다."
          actionLabel={isAuthenticated ? '첫 글 작성하기' : undefined}
          onAction={isAuthenticated ? () => router.push('/community/write') : undefined}
        />
      ) : (
        <Stack spacing={0}>
          {/* 고정 게시글 */}
          {pinnedPosts.length > 0 && (
            <>
              <Stack spacing={1.5}>
                {pinnedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* 일반 게시글 */}
          <Grid container spacing={1.5}>
            {normalPosts.map((post) => (
              <Grid key={post.id} size={{ xs: 12, md: 6 }}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => {
              setPage(p)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  )
}
