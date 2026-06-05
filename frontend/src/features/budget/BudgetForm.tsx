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
  amount: string
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
  editTarget?: BudgetWithUsage | null
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
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    defaultValues: { categoryId: '', amount: '' },
  })

  useEffect(() => {
    if (editTarget) {
      reset({
        categoryId: String(editTarget.categoryId),
        amount: formatNum(String(editTarget.amount)),
      })
    } else {
      reset({ categoryId: '', amount: '' })
    }
  }, [editTarget, reset])

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: Infinity,
  })
  const expenseCategories = (catRes?.data ?? []).filter((c) => c.type === 'EXPENSE')

  const yearMonth = `${year}-${String(month).padStart(2, '0')}`

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['budgets', year, month] })
      showToast('예산이 등록되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('예산 등록에 실패했습니다.', 'error'),
  })

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { amount: number } }) =>
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
    reset({ categoryId: '', amount: '' })
    onClose()
  }

  const onSubmit = (data: BudgetFormValues) => {
    const amount = parseNum(data.amount)
    if (isEditMode && editTarget) {
      update({ id: editTarget.id, data: { amount } })
    } else {
      create({
        categoryId: Number(data.categoryId) || null,
        amount,
        yearMonth,
      })
    }
  }

  const availableCategories = isEditMode
    ? expenseCategories
    : expenseCategories.filter((c) => !existingCategoryIds.includes(c.id))

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditMode ? '예산 수정' : '예산 추가'}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
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

          <Controller
            name="amount"
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
                error={!!errors.amount}
                helperText={errors.amount?.message}
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
