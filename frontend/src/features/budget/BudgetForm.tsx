'use client'
import { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormHelperText,
  CircularProgress,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { budgetService } from '@/services/budget.service'
import { categoryService } from '@/services/category.service'
import { useToastStore } from '@/stores/toastStore'
import type { BudgetWithUsage } from '@/types/budget'

interface BudgetFormValues {
  categoryId: string
  limitAmount: string
}

function formatNum(v: string): string {
  const d = v.replace(/[^0-9]/g, '')
  return d ? Number(d).toLocaleString('ko-KR') : ''
}

function parseNum(v: string): number {
  return Number(v.replace(/[^0-9]/g, ''))
}

interface BudgetFormProps {
  open: boolean
  onClose: () => void
  year: number
  month: number
  /** 수정 모드: 기존 예산 전달 */
  editTarget?: BudgetWithUsage | null
  /** 이미 예산이 설정된 카테고리 ID 목록 (등록 모드에서 중복 방지) */
  existingCategoryIds: number[]
}

export function BudgetForm({
  open,
  onClose,
  year,
  month,
  editTarget,
  existingCategoryIds,
}: BudgetFormProps) {
  const isEditMode = !!editTarget
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    defaultValues: { categoryId: '', limitAmount: '' },
  })

  // editTarget 변경 시 폼 초기화
  useEffect(() => {
    if (editTarget) {
      reset({
        categoryId: String(editTarget.categoryId),
        limitAmount: formatNum(String(editTarget.limitAmount)),
      })
    } else {
      reset({ categoryId: '', limitAmount: '' })
    }
  }, [editTarget, reset])

  // EXPENSE 카테고리 목록
  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: Infinity,
  })
  const expenseCategories = (catRes?.data ?? []).filter((c) => c.type === 'EXPENSE')

  // 등록 mutation
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['budgets', year, month] })
      showToast('예산이 등록되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('예산 등록에 실패했습니다.', 'error'),
  })

  // 수정 mutation
  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { limitAmount: number } }) =>
      budgetService.update(id, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['budgets', year, month] })
      showToast('예산이 수정되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('예산 수정에 실패했습니다.', 'error'),
  })

  const isPending = isCreating || isUpdating

  const handleClose = () => {
    reset({ categoryId: '', limitAmount: '' })
    onClose()
  }

  const onSubmit = (data: BudgetFormValues) => {
    const amount = parseNum(data.limitAmount)
    if (isEditMode && editTarget) {
      update({ id: editTarget.id, data: { limitAmount: amount } })
    } else {
      create({
        categoryId: Number(data.categoryId),
        limitAmount: amount,
        year,
        month,
      })
    }
  }

  // 이미 예산이 설정된 카테고리는 등록 시 제외
  const availableCategories = isEditMode
    ? expenseCategories
    : expenseCategories.filter((c) => !existingCategoryIds.includes(c.id))

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditMode ? '예산 수정' : '예산 추가'}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {/* 카테고리 — 수정 모드에서는 비활성 */}
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: '카테고리를 선택해주세요.' }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.categoryId} disabled={isEditMode}>
                <InputLabel>카테고리 (지출)</InputLabel>
                <Select {...field} label="카테고리 (지출)">
                  {availableCategories.map((cat) => (
                    <MenuItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </MenuItem>
                  ))}
                  {availableCategories.length === 0 && (
                    <MenuItem disabled value="">
                      설정 가능한 카테고리 없음
                    </MenuItem>
                  )}
                </Select>
                {errors.categoryId && (
                  <FormHelperText>{errors.categoryId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* 예산 금액 */}
          <Controller
            name="limitAmount"
            control={control}
            rules={{
              required: '예산 금액을 입력해주세요.',
              validate: (v) => {
                const n = parseNum(v)
                if (n < 1000) return '예산은 1,000원 이상이어야 합니다.'
                if (n > 100_000_000) return '예산은 1억 이하여야 합니다.'
                return true
              },
            }}
            render={({ field }) => (
              <TextField
                label="예산 금액"
                type="text"
                inputMode="numeric"
                fullWidth
                autoFocus={isEditMode}
                error={!!errors.limitAmount}
                helperText={errors.limitAmount?.message}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
                value={field.value}
                onChange={(e) => field.onChange(formatNum(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isPending}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isEditMode ? '수정' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
