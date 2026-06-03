'use client'
import { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Alert,
} from '@mui/material'
import { Plus, PencilSimple, Trash, Lock } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { CategoryForm } from '@/features/category/CategoryForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useToastStore } from '@/stores/toastStore'
import type { Category, TransactionType } from '@/types/category'

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: (c: Category) => void
  onDelete: (id: number) => void
}) {
  const locked = category.isDefault
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 2 },
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: category.color ?? 'grey.300',
            fontSize: '0.85rem',
            flexShrink: 0,
          }}
        >
          {category.name.slice(0, 1)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {category.name}
          </Typography>
          {locked && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
              <Lock size={12} />
              <Typography variant="caption">기본</Typography>
            </Stack>
          )}
        </Box>

        {/* 내 카테고리만 수정/삭제 */}
        {!locked && (
          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
            <Tooltip title="수정">
              <IconButton size="small" onClick={() => onEdit(category)}>
                <PencilSimple size={15} />
              </IconButton>
            </Tooltip>
            <Tooltip title="삭제">
              <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => onDelete(category.id)}>
                <Trash size={15} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default function CategoriesPage() {
  const [tab, setTab] = useState<TransactionType>('EXPENSE')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  const { data: catRes, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  })

  const categories = catRes?.data ?? []

  // 현재 탭 + 기본/내 구분
  const { defaultCats, myCats } = useMemo(() => {
    const filtered = categories.filter((c) => c.type === tab)
    return {
      defaultCats: filtered.filter((c) => c.isDefault),
      myCats: filtered.filter((c) => !c.isDefault),
    }
  }, [categories, tab])

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['categories'] })
      showToast('카테고리가 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const handleEdit = (c: Category) => {
    setEditTarget(c)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditTarget(null)
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          카테고리 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus weight="bold" />}
          onClick={() => {
            setEditTarget(null)
            setFormOpen(true)
          }}
        >
          추가
        </Button>
      </Stack>

      {/* 탭 */}
      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="지출" value="EXPENSE" />
        <Tab label="수입" value="INCOME" />
      </Tabs>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          카테고리를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <Stack spacing={4}>
          {/* 내 카테고리 */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              내 카테고리
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {myCats.length === 0 ? (
              <EmptyState
                message="직접 만든 카테고리가 없습니다."
                actionLabel="카테고리 추가"
                onAction={() => {
                  setEditTarget(null)
                  setFormOpen(true)
                }}
              />
            ) : (
              <Grid container spacing={1.5}>
                {myCats.map((c) => (
                  <Grid key={c.id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <CategoryCard category={c} onEdit={handleEdit} onDelete={(id) => setDeleteTarget(id)} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* 기본 카테고리 */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              기본 카테고리
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1.5}>
              {defaultCats.map((c) => (
                <Grid key={c.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <CategoryCard category={c} onEdit={handleEdit} onDelete={(id) => setDeleteTarget(id)} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      )}

      {/* 추가/수정 모달 — key로 editTarget/tab 변경 시 폼 초기값 반영 */}
      <CategoryForm
        key={`${editTarget?.id ?? 'new'}-${tab}-${formOpen}`}
        open={formOpen}
        onClose={handleFormClose}
        type={tab}
        editTarget={editTarget}
      />

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="카테고리 삭제"
        description="이 카테고리를 삭제하시겠습니까? 해당 카테고리의 기존 거래내역은 유지됩니다."
        loading={isDeleting}
        onConfirm={() => deleteTarget !== null && deleteCategory(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
