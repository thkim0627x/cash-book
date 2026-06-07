'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
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
  Typography,
  Box,
  Avatar,
  Divider,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { assetService } from '@/services/asset.service'
import { transactionService } from '@/services/transaction.service'
import { useToastStore } from '@/stores/toastStore'
import type { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/types/transaction'

type TxnTabType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

const CATEGORY_EMOJI: Record<string, string> = {
  월급: '💰', 급여: '💰', 부수입: '💵', 용돈: '🎁', 상여: '🏆', 금융소득: '📈',
  식비: '🍔', '교통/차량': '🚗', 교통: '🚗', 문화생활: '🎬', '문화/여가': '🎬',
  '마트/편의점': '🛒', 쇼핑: '🛒', '패션/미용': '👗', 생활용품: '🧴',
  '주거/통신': '🏠', 주거: '🏠', 통신: '📱', 건강: '💊', '의료/건강': '💊',
  교육: '📚', '경조사/회비': '🎊', 부모님: '👪',
  기타: '➕', 기타수입: '➕', 기타지출: '➕',
  이체: '🔄', 보험: '🛡️', '적금/투자': '📊',
}

function getCategoryEmoji(name: string): string {
  return CATEGORY_EMOJI[name] ?? name.slice(0, 1)
}

interface NumberPadProps {
  digits: string
  onDigits: (d: string) => void
  onConfirm: () => void
  onCancel: () => void
}

function NumberPad({ digits, onDigits, onConfirm, onCancel }: NumberPadProps) {
  const handle = (k: string) => {
    if (k === '⌫') { onDigits(digits.slice(0, -1)); return }
    if (k === 'C') { onDigits(''); return }
    if (digits.length >= 10) return
    onDigits(digits + k)
  }
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫']
  const display = Number(digits || '0').toLocaleString('ko-KR')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 2.5, textAlign: 'right', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" fontWeight={700} component="span">
          {display}
        </Typography>
        <Typography variant="h5" component="span" color="text.secondary" ml={0.5}>
          원
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', flex: 1 }}>
        {keys.map((k) => (
          <Button
            key={k}
            variant="text"
            onClick={() => handle(k)}
            sx={{
              py: 2.5,
              fontSize: '1.4rem',
              fontWeight: 500,
              borderRadius: 0,
              color:
                k === 'C' ? 'error.main' : k === '⌫' ? 'text.secondary' : 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {k}
          </Button>
        ))}
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" onClick={onCancel} size="large">
          취소
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          size="large"
          disabled={!digits || Number(digits) < 1}
        >
          확인
        </Button>
      </Stack>
    </Box>
  )
}

interface FormValues {
  txnDate: string
  memo: string
  assetId: string
  fromAssetId: string
  toAssetId: string
  fee: string
}

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  defaultYear: number
  defaultMonth: number
  defaultType?: 'INCOME' | 'EXPENSE'
  editTarget?: Transaction | null
}

export function TransactionForm({
  open,
  onClose,
  defaultYear,
  defaultMonth,
  defaultType,
  editTarget,
}: TransactionFormProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  const isEditMode = !!editTarget

  const [txnType, setTxnType] = useState<TxnTabType>(
    isEditMode ? (editTarget.type as TxnTabType) : (defaultType ?? 'EXPENSE')
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    editTarget?.categoryId ?? null
  )
  const [amountDigits, setAmountDigits] = useState(
    editTarget ? String(editTarget.amount) : ''
  )
  const [numPadMode, setNumPadMode] = useState(false)
  const [numPadDigits, setNumPadDigits] = useState('')

  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<FormValues>({
      defaultValues: {
        txnDate: editTarget?.txnDate ?? todayString(),
        memo: editTarget?.memo ?? '',
        assetId: editTarget?.assetId ? String(editTarget.assetId) : '',
        fromAssetId: '',
        toAssetId: '',
        fee: '',
      },
    })

  // Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: Infinity,
  })
  const allCategories = categoriesRes?.data ?? []
  const typeCategories = allCategories.filter(
    (c) => txnType !== 'TRANSFER' && c.type === txnType
  )
  const transferExpenseCat =
    allCategories.find((c) => c.name === '이체' && c.type === 'EXPENSE') ??
    allCategories.find((c) => c.type === 'EXPENSE')
  const transferIncomeCat =
    allCategories.find((c) => c.name === '이체' && c.type === 'INCOME') ??
    allCategories.find((c) => c.type === 'INCOME')

  // Assets
  const { data: assetsRes } = useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAll,
    staleTime: Infinity,
  })
  const assets = assetsRes?.data ?? []

  // Create
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (data: TransactionCreateRequest) => transactionService.create(data),
    onError: () => showToast('거래내역 등록에 실패했습니다.', 'error'),
  })

  // Update
  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionUpdateRequest }) =>
      transactionService.update(id, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
      showToast('거래내역이 수정되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('거래내역 수정에 실패했습니다.', 'error'),
  })

  const isPending = isCreating || isUpdating

  const handleClose = () => {
    reset()
    setTxnType('EXPENSE')
    setSelectedCategoryId(null)
    setAmountDigits('')
    setNumPadMode(false)
    onClose()
  }

  const handleTypeChange = (newType: TxnTabType) => {
    if (isEditMode) return
    setTxnType(newType)
    setSelectedCategoryId(null)
  }

  const openNumPad = () => {
    setNumPadDigits(amountDigits)
    setNumPadMode(true)
  }

  const onSubmit = (data: FormValues) => {
    const amount = Number(amountDigits)

    if (!amount || amount < 1) {
      showToast('금액을 입력해주세요.', 'warning')
      return
    }

    if (txnType === 'TRANSFER') {
      if (!transferExpenseCat || !transferIncomeCat) {
        showToast('이체 카테고리가 없습니다. 카테고리 설정을 확인해주세요.', 'error')
        return
      }
      const fee = Number(data.fee.replace(/[^0-9]/g, '') || '0')
      const memo = data.memo || '이체'

      create(
        {
          type: 'EXPENSE',
          categoryId: transferExpenseCat.id,
          amount: amount + fee,
          txnDate: data.txnDate,
          memo,
        },
        {
          onSuccess: () => {
            create(
              {
                type: 'INCOME',
                categoryId: transferIncomeCat.id,
                amount,
                txnDate: data.txnDate,
                memo,
              },
              {
                onSuccess: () => {
                  queryClientInstance.invalidateQueries({
                    queryKey: ['transactions', defaultYear, defaultMonth],
                  })
                  showToast('이체가 등록되었습니다.', 'success')
                  handleClose()
                },
              }
            )
          },
        }
      )
      return
    }

    if (!selectedCategoryId) {
      showToast('분류를 선택해주세요.', 'warning')
      return
    }

    const payload = {
      categoryId: selectedCategoryId,
      amount,
      txnDate: data.txnDate,
      memo: data.memo || undefined,
    }

    if (isEditMode && editTarget) {
      update({ id: editTarget.id, data: { type: editTarget.type, ...payload } })
    } else {
      create(
        { type: txnType as 'INCOME' | 'EXPENSE', ...payload },
        {
          onSuccess: () => {
            queryClientInstance.invalidateQueries({
              queryKey: ['transactions', defaultYear, defaultMonth],
            })
            showToast('거래내역이 등록되었습니다.', 'success')
            handleClose()
          },
        }
      )
    }
  }

  const tabColors: Record<TxnTabType, string> = {
    INCOME: theme.palette.info.main,
    EXPENSE: theme.palette.error.main,
    TRANSFER: theme.palette.text.secondary,
  }
  const tabLabels: Record<TxnTabType, string> = {
    INCOME: '수입',
    EXPENSE: '지출',
    TRANSFER: '이체',
  }

  const selectedBg =
    txnType === 'INCOME' ? 'rgba(2,136,209,0.10)' : 'rgba(211,47,47,0.10)'
  const selectedBorder = tabColors[txnType === 'TRANSFER' ? 'EXPENSE' : txnType]

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: fullScreen
          ? { m: 0, height: '100dvh', maxHeight: '100dvh', borderRadius: 0 }
          : {},
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: fullScreen ? '100%' : undefined,
        }}
      >
        {numPadMode ? (
          /* ── Number pad mode ── */
          <NumberPad
            digits={numPadDigits}
            onDigits={setNumPadDigits}
            onConfirm={() => {
              setAmountDigits(numPadDigits)
              setNumPadMode(false)
            }}
            onCancel={() => setNumPadMode(false)}
          />
        ) : (
          <>
            {/* Type tabs */}
            <Box
              sx={{
                display: 'flex',
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              {(['INCOME', 'EXPENSE', 'TRANSFER'] as TxnTabType[]).map((type) => {
                const isSelected = txnType === type
                const isDisabled = isEditMode && type !== txnType
                return (
                  <Button
                    key={type}
                    fullWidth
                    onClick={() => handleTypeChange(type)}
                    disabled={isDisabled}
                    sx={{
                      py: 1.5,
                      borderRadius: 0,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: isSelected ? tabColors[type] : 'text.secondary',
                      borderBottom: isSelected
                        ? `3px solid ${tabColors[type]}`
                        : '3px solid transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&.Mui-disabled': { opacity: 0.35 },
                    }}
                  >
                    {tabLabels[type]}
                  </Button>
                )
              })}
            </Box>

            {/* Form content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
              {txnType !== 'TRANSFER' ? (
                <Stack spacing={2.5}>
                  {/* Category grid */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      mb={1}
                      display="block"
                    >
                      분류
                    </Typography>
                    {typeCategories.length === 0 ? (
                      <Typography variant="body2" color="text.disabled">
                        카테고리가 없습니다.
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: 1,
                        }}
                      >
                        {typeCategories.map((cat) => {
                          const isSelected = selectedCategoryId === cat.id
                          return (
                            <Box
                              key={cat.id}
                              onClick={() => setSelectedCategoryId(cat.id)}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                py: 1.5,
                                px: 0.5,
                                borderRadius: 2,
                                cursor: 'pointer',
                                bgcolor: isSelected ? selectedBg : 'grey.50',
                                border: '2px solid',
                                borderColor: isSelected ? selectedBorder : 'transparent',
                                transition: 'all 0.12s',
                                '&:hover': { bgcolor: isSelected ? selectedBg : 'action.hover' },
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  mb: 0.5,
                                  bgcolor: cat.color ?? '#e0e0e0',
                                  fontSize: '1rem',
                                }}
                              >
                                {getCategoryEmoji(cat.name)}
                              </Avatar>
                              <Typography
                                variant="caption"
                                fontWeight={isSelected ? 700 : 400}
                                color={isSelected ? selectedBorder : 'text.secondary'}
                                textAlign="center"
                                sx={{ lineHeight: 1.2, wordBreak: 'keep-all', fontSize: '0.68rem' }}
                              >
                                {cat.name}
                              </Typography>
                            </Box>
                          )
                        })}
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  {/* Date */}
                  <TextField
                    label="날짜"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.txnDate}
                    helperText={errors.txnDate?.message}
                    {...register('txnDate', { required: '날짜를 선택해주세요.' })}
                  />

                  {/* Amount */}
                  <TextField
                    label="금액"
                    fullWidth
                    size="small"
                    value={
                      amountDigits ? Number(amountDigits).toLocaleString('ko-KR') : ''
                    }
                    placeholder="0"
                    inputProps={isMobile ? { readOnly: true } : undefined}
                    inputMode={isMobile ? undefined : 'numeric'}
                    onClick={isMobile ? openNumPad : undefined}
                    onChange={
                      isMobile
                        ? undefined
                        : (e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, '')
                            setAmountDigits(digits.slice(0, 10))
                          }
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">원</InputAdornment>,
                    }}
                    sx={isMobile ? { cursor: 'pointer', '& input': { cursor: 'pointer' } } : {}}
                  />

                  {/* Asset */}
                  <Controller
                    name="assetId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>자산</InputLabel>
                        <Select {...field} label="자산">
                          <MenuItem value="">선택 안 함</MenuItem>
                          {assets.map((a) => (
                            <MenuItem key={a.id} value={String(a.id)}>
                              {a.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  {/* Memo */}
                  <TextField
                    label="내용"
                    placeholder="거래 내용을 입력해주세요"
                    fullWidth
                    size="small"
                    error={!!errors.memo}
                    helperText={errors.memo?.message}
                    {...register('memo', {
                      maxLength: { value: 100, message: '내용은 100자 이하여야 합니다.' },
                    })}
                  />
                </Stack>
              ) : (
                /* TRANSFER form */
                <Stack spacing={2.5}>
                  {/* Amount */}
                  <TextField
                    label="금액"
                    fullWidth
                    size="small"
                    value={
                      amountDigits ? Number(amountDigits).toLocaleString('ko-KR') : ''
                    }
                    placeholder="0"
                    inputProps={isMobile ? { readOnly: true } : undefined}
                    inputMode={isMobile ? undefined : 'numeric'}
                    onClick={isMobile ? openNumPad : undefined}
                    onChange={
                      isMobile
                        ? undefined
                        : (e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, '')
                            setAmountDigits(digits.slice(0, 10))
                          }
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">원</InputAdornment>,
                    }}
                    sx={isMobile ? { cursor: 'pointer', '& input': { cursor: 'pointer' } } : {}}
                  />

                  {/* Fee */}
                  <Controller
                    name="fee"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="수수료"
                        fullWidth
                        size="small"
                        value={field.value}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^0-9]/g, '')
                          field.onChange(
                            digits ? Number(digits).toLocaleString('ko-KR') : ''
                          )
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">원</InputAdornment>,
                        }}
                      />
                    )}
                  />

                  <Divider />

                  {/* From Asset */}
                  <Controller
                    name="fromAssetId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>출금</InputLabel>
                        <Select {...field} label="출금">
                          <MenuItem value="">선택 안 함</MenuItem>
                          {assets.map((a) => (
                            <MenuItem key={a.id} value={String(a.id)}>
                              {a.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  {/* To Asset */}
                  <Controller
                    name="toAssetId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>입금</InputLabel>
                        <Select {...field} label="입금">
                          <MenuItem value="">선택 안 함</MenuItem>
                          {assets.map((a) => (
                            <MenuItem key={a.id} value={String(a.id)}>
                              {a.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  {/* Date */}
                  <TextField
                    label="날짜"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.txnDate}
                    helperText={errors.txnDate?.message}
                    {...register('txnDate', { required: '날짜를 선택해주세요.' })}
                  />

                  {/* Memo */}
                  <TextField
                    label="내용"
                    placeholder="이체 내용을 입력해주세요"
                    fullWidth
                    size="small"
                    {...register('memo')}
                  />
                </Stack>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      {!numPadMode && (
        <DialogActions sx={{ px: 2.5, py: 2, gap: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending} fullWidth>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            fullWidth
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isEditMode ? '수정' : '저장'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
