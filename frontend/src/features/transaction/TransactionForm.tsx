'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { transactionService } from '@/services/transaction.service'
import { useToastStore } from '@/stores/toastStore'
import type { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/types/transaction'
import type { TransactionType } from '@/types/category'

interface TransactionFormValues {
  categoryId: string
  amount: string
  txnDate: string
  memo: string
}

function formatNumber(value: string): string {
  const digits = value.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('ko-KR')
}

function parseNumber(formatted: string): number {
  return Number(formatted.replace(/[^0-9]/g, ''))
}

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  defaultYear: number
  defaultMonth: number
  /** 수정 모드: 기존 거래내역 전달 */
  editTarget?: Transaction | null
}

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TransactionForm({
  open,
  onClose,
  defaultYear,
  defaultMonth,
  editTarget,
}: TransactionFormProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  const isEditMode = !!editTarget

  // 수정 모드에서는 type 고정, 등록 모드에서는 EXPENSE 기본
  const [txnType, setTxnType] = useState<TransactionType>(
    editTarget?.type ?? 'EXPENSE'
  )

  // editTarget 기반 폼 초기값 (open/editTarget 변경 시 호출부 key로 remount)
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: editTarget
      ? {
          categoryId: String(editTarget.categoryId),
          amount: formatNumber(String(editTarget.amount)),
          txnDate: editTarget.txnDate,
          memo: editTarget.memo ?? '',
        }
      : {
          categoryId: '',
          amount: '',
          txnDate: todayString(),
          memo: '',
        },
  })

  // 카테고리 목록
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: Infinity,
  })
  const categories = (categoriesRes?.data ?? []).filter((c) => c.type === txnType)

  // 등록 mutation
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (data: TransactionCreateRequest) => transactionService.create(data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({
        queryKey: ['transactions', defaultYear, defaultMonth],
      })
      showToast('거래내역이 등록되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('거래내역 등록에 실패했습니다.', 'error'),
  })

  // 수정 mutation
  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionUpdateRequest }) =>
      transactionService.update(id, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({
        queryKey: ['transactions', defaultYear, defaultMonth],
      })
      showToast('거래내역이 수정되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('거래내역 수정에 실패했습니다.', 'error'),
  })

  const isPending = isCreating || isUpdating

  const handleClose = () => {
    reset({ categoryId: '', amount: '', txnDate: todayString(), memo: '' })
    setTxnType('EXPENSE')
    onClose()
  }

  const onSubmit = (data: TransactionFormValues) => {
    const payload = {
      categoryId: Number(data.categoryId),
      amount: parseNumber(data.amount),
      txnDate: data.txnDate,
      memo: data.memo || undefined,
    }

    if (isEditMode && editTarget) {
      update({ id: editTarget.id, data: payload })
    } else {
      create({ type: txnType, ...payload })
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{isEditMode ? '거래 수정' : '거래 추가'}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>

          {/* 수입/지출 토글 — 수정 모드에서는 type 표시만 */}
          {isEditMode ? (
            <Typography
              variant="subtitle1"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: txnType === 'INCOME' ? 'success.main' : 'error.main',
                fontWeight: 700,
              }}
            >
              {txnType === 'INCOME' ? '수입' : '지출'}
              <Typography variant="caption" color="text.secondary" component="span">
                (거래 유형은 수정할 수 없습니다)
              </Typography>
            </Typography>
          ) : (
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={txnType}
              onChange={(_, val) => val && setTxnType(val)}
            >
              <ToggleButton
                value="INCOME"
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': {
                    bgcolor: 'success.light',
                    color: 'success.main',
                    borderColor: 'success.main',
                  },
                }}
              >
                수입
              </ToggleButton>
              <ToggleButton
                value="EXPENSE"
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': {
                    bgcolor: 'error.light',
                    color: 'error.main',
                    borderColor: 'error.main',
                  },
                }}
              >
                지출
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          {/* 날짜 */}
          <TextField
            label="날짜"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.txnDate}
            helperText={errors.txnDate?.message}
            {...register('txnDate', { required: '날짜를 선택해주세요.' })}
          />

          {/* 카테고리 */}
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: '카테고리를 선택해주세요.' }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.categoryId}>
                <InputLabel>카테고리</InputLabel>
                <Select {...field} label="카테고리">
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <FormHelperText>{errors.categoryId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* 금액 */}
          <Controller
            name="amount"
            control={control}
            rules={{
              required: '금액을 입력해주세요.',
              validate: (v) => {
                const n = parseNumber(v)
                if (n < 1) return '금액은 1원 이상이어야 합니다.'
                if (n > 1_000_000_000) return '금액은 10억 이하여야 합니다.'
                return true
              },
            }}
            render={({ field }) => (
              <TextField
                label="금액"
                type="text"
                inputMode="numeric"
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
                value={field.value}
                onChange={(e) => field.onChange(formatNumber(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />

          {/* 내용 */}
          <TextField
            label="내용"
            placeholder="거래 내용을 입력해주세요"
            fullWidth
            error={!!errors.memo}
            helperText={errors.memo?.message}
            {...register('memo', {
              maxLength: { value: 100, message: '내용은 100자 이하여야 합니다.' },
            })}
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
