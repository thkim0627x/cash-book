'use client'
import { useState, useRef, useEffect } from 'react'
import {
  Dialog, DialogContent,
  Button, Stack, useMediaQuery, useTheme, CircularProgress,
  Typography, Box, Chip, Divider, TextField, IconButton,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { assetService } from '@/services/asset.service'
import { transactionService } from '@/services/transaction.service'
import { useToastStore } from '@/stores/toastStore'
import { X } from '@phosphor-icons/react'
import type { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/types/transaction'

type TxnTabType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

const EMOJI: Record<string, string> = {
  월급: '💰', 급여: '💰', 부수입: '💵', 용돈: '🎁', 상여: '🏆', 금융소득: '📈',
  식비: '🍔', '교통/차량': '🚗', 교통: '🚗', 문화생활: '🎬', '문화/여가': '🎬',
  '마트/편의점': '🛒', 쇼핑: '🛒', '패션/미용': '👗', 생활용품: '🧴',
  '주거/통신': '🏠', 주거: '🏠', 통신: '📱', 건강: '💊', '의료/건강': '💊',
  교육: '📚', '경조사/회비': '🎊', 부모님: '👪',
  기타: '➕', 기타수입: '➕', 기타지출: '➕',
  이체: '🔄', 보험: '🛡️', '적금/투자': '📊',
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDate(s: string) {
  if (s === todayStr()) return '오늘'
  const d = new Date(s)
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`
}

// ── 숫자 키패드 ────────────────────────────────────────────────────────────
function NumKeypad({ digits, onDigits }: { digits: string; onDigits: (d: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'] as const
  const handle = (k: string) => {
    if (k === '⌫') { onDigits(digits.slice(0, -1)); return }
    if (digits.length >= 11) return
    if (k === '00') { if (!digits || digits === '0') return; onDigits(digits + '00'); return }
    if (digits === '0') return
    onDigits(digits + k)
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {keys.map((k) => (
        <Button
          key={k}
          variant="text"
          onClick={() => handle(k)}
          sx={{
            py: { xs: 1.6, sm: 1.4 },
            fontSize: { xs: '1.25rem', sm: '1.15rem' },
            fontWeight: k === '⌫' ? 400 : 600,
            borderRadius: 0,
            color: k === '⌫' ? 'text.secondary' : 'text.primary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {k}
        </Button>
      ))}
    </Box>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────
interface TransactionFormProps {
  open: boolean
  onClose: () => void
  defaultYear: number
  defaultMonth: number
  defaultType?: 'INCOME' | 'EXPENSE'
  editTarget?: Transaction | null
}

export function TransactionForm({
  open, onClose, defaultYear, defaultMonth, defaultType, editTarget,
}: TransactionFormProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const showToast = useToastStore((s) => s.show)
  const qc = useQueryClient()
  const isEdit = !!editTarget
  const dateRef = useRef<HTMLInputElement>(null)

  // ── state ──
  const [tab, setTab] = useState<TxnTabType>(
    isEdit ? (editTarget.type as TxnTabType) : (defaultType ?? 'EXPENSE')
  )
  const [digits, setDigits] = useState(isEdit ? String(editTarget.amount) : '')
  const [feeDigits, setFeeDigits] = useState('')
  const [numTarget, setNumTarget] = useState<'amount' | 'fee'>('amount')
  const [catId, setCatId] = useState<number | null>(editTarget?.categoryId ?? null)
  const [assetId, setAssetId] = useState(editTarget?.assetId ? String(editTarget.assetId) : '')
  const [fromAsset, setFromAsset] = useState('')
  const [toAsset, setToAsset] = useState('')
  const [memo, setMemo] = useState(editTarget?.memo ?? '')
  const [date, setDate] = useState(editTarget?.txnDate ?? todayStr())
  const [showAll, setShowAll] = useState(false)

  // reset on open
  useEffect(() => {
    if (open && !isEdit) {
      setTab(defaultType ?? 'EXPENSE')
      setDigits(''); setFeeDigits('')
      setNumTarget('amount')
      setCatId(null); setAssetId('')
      setFromAsset(''); setToAsset('')
      setMemo(''); setDate(todayStr())
      setShowAll(false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── data ──
  const { data: catRes } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll, staleTime: Infinity })
  const { data: assetRes } = useQuery({ queryKey: ['assets'], queryFn: assetService.getAll, staleTime: Infinity })
  const allCats = catRes?.data ?? []
  const assets = assetRes?.data ?? []
  const typeCats = allCats.filter(c => tab !== 'TRANSFER' && c.type === tab && c.name !== '이체')
  const visibleCats = showAll ? typeCats : typeCats.slice(0, 6)
  const xferExpCat = allCats.find(c => c.name === '이체' && c.type === 'EXPENSE') ?? allCats.find(c => c.type === 'EXPENSE')
  const xferIncCat = allCats.find(c => c.name === '이체' && c.type === 'INCOME') ?? allCats.find(c => c.type === 'INCOME')

  // ── mutations ──
  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (d: TransactionCreateRequest) => transactionService.create(d),
    onError: () => showToast('등록에 실패했습니다.', 'error'),
  })
  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionUpdateRequest }) => transactionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
      showToast('수정되었습니다.', 'success')
      onClose()
    },
    onError: () => showToast('수정에 실패했습니다.', 'error'),
  })
  const saving = creating || updating

  // ── save ──
  const handleSave = () => {
    const amount = Number(digits)
    if (!amount || amount < 1) { showToast('금액을 입력해주세요.', 'warning'); return }

    if (tab === 'TRANSFER') {
      if (!xferExpCat || !xferIncCat) { showToast('이체 카테고리가 없습니다.', 'error'); return }
      const fee = Number(feeDigits || '0')
      const m = memo || '이체'
      create({ type: 'EXPENSE', categoryId: xferExpCat.id, amount: amount + fee, txnDate: date, memo: m }, {
        onSuccess: () => create(
          { type: 'INCOME', categoryId: xferIncCat.id, amount, txnDate: date, memo: m },
          {
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
              showToast('이체가 등록되었습니다.', 'success')
              onClose()
            },
          }
        ),
      })
      return
    }

    if (!catId) { showToast('분류를 선택해주세요.', 'warning'); return }
    const payload = { categoryId: catId, amount, txnDate: date, memo: memo || undefined, assetId: assetId ? Number(assetId) : undefined }

    if (isEdit && editTarget) {
      update({ id: editTarget.id, data: { type: editTarget.type, ...payload } })
    } else {
      create({ type: tab as 'INCOME' | 'EXPENSE', ...payload }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
          showToast('등록되었습니다.', 'success')
          onClose()
        },
      })
    }
  }

  // ── colors ──
  const tabColor = { INCOME: theme.palette.info.main, EXPENSE: theme.palette.error.main, TRANSFER: theme.palette.text.primary }
  const amtColor = tab === 'INCOME' ? 'info.main' : tab === 'EXPENSE' ? 'error.main' : 'text.primary'

  const activeDigits = numTarget === 'amount' ? digits : feeDigits
  const setActiveDigits = (d: string) => numTarget === 'amount' ? setDigits(d) : setFeeDigits(d)
  const displayAmt = Number(digits || '0').toLocaleString('ko-KR')
  const displayFee = Number(feeDigits || '0').toLocaleString('ko-KR')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : undefined,
          height: isMobile ? '100dvh' : '92vh',
          maxHeight: isMobile ? '100dvh' : '92vh',
          borderRadius: isMobile ? 0 : 2,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── 탭 + 닫기 ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
          {(['INCOME', 'EXPENSE', 'TRANSFER'] as TxnTabType[]).map((t) => {
            const sel = tab === t
            const labels = { INCOME: '수입', EXPENSE: '지출', TRANSFER: '이체' }
            return (
              <Button
                key={t}
                onClick={() => { if (!isEdit) { setTab(t); setCatId(null); setShowAll(false); setNumTarget('amount') } }}
                disabled={isEdit && t !== tab}
                sx={{
                  flex: 1, py: 1.4, borderRadius: 0, fontWeight: 700, fontSize: '0.88rem',
                  color: sel ? tabColor[t] : 'text.secondary',
                  borderBottom: sel ? `3px solid ${tabColor[t]}` : '3px solid transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&.Mui-disabled': { opacity: 0.3 },
                }}
              >
                {labels[t]}
              </Button>
            )
          })}
          <IconButton size="small" onClick={onClose} sx={{ mr: 1, flexShrink: 0 }}>
            <X size={18} />
          </IconButton>
        </Box>

        {/* ── 금액 표시 ── */}
        <Box
          sx={{
            flexShrink: 0, textAlign: 'center',
            px: 3, pt: 2, pb: 1.5,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'baseline', gap: 0.5,
              cursor: tab === 'TRANSFER' ? 'pointer' : 'default',
              opacity: tab === 'TRANSFER' && numTarget !== 'amount' ? 0.4 : 1,
            }}
            onClick={() => tab === 'TRANSFER' && setNumTarget('amount')}
          >
            <Typography
              fontWeight={800} color={amtColor}
              sx={{ fontSize: { xs: '2.4rem', sm: '2.6rem' }, lineHeight: 1 }}
            >
              {displayAmt}
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400}>원</Typography>
          </Box>

          {/* TRANSFER: 수수료 토글 */}
          {tab === 'TRANSFER' && (
            <Box sx={{ mt: 0.75 }}>
              <Chip
                label={`수수료 ${displayFee}원`}
                size="small"
                onClick={() => setNumTarget(numTarget === 'fee' ? 'amount' : 'fee')}
                variant={numTarget === 'fee' ? 'filled' : 'outlined'}
                color={numTarget === 'fee' ? 'warning' : 'default'}
                sx={{ fontSize: '0.75rem', height: 26, cursor: 'pointer' }}
              />
            </Box>
          )}
        </Box>

        <Divider />

        {/* ── 스크롤 영역 ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1.5, pb: 1 }}>

          {tab !== 'TRANSFER' ? (
            <Stack spacing={2}>
              {/* 분류 */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.75}>
                  분류
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.75 }}>
                  {visibleCats.map((cat) => {
                    const sel = catId === cat.id
                    return (
                      <Chip
                        key={cat.id}
                        label={`${EMOJI[cat.name] ?? ''} ${cat.name}`}
                        onClick={() => setCatId(cat.id)}
                        variant={sel ? 'filled' : 'outlined'}
                        sx={{
                          justifyContent: 'flex-start',
                          height: 42, fontSize: '0.83rem',
                          fontWeight: sel ? 700 : 400,
                          bgcolor: sel
                            ? tab === 'INCOME' ? 'rgba(2,136,209,0.12)' : 'rgba(211,47,47,0.10)'
                            : undefined,
                          borderColor: sel ? tabColor[tab] : 'divider',
                          color: sel ? tabColor[tab] : 'text.primary',
                          '& .MuiChip-label': { px: 1.5 },
                        }}
                      />
                    )
                  })}
                  {typeCats.length > 6 && (
                    <Chip
                      label={showAll ? '접기 ▲' : `+${typeCats.length - 6}개 더보기`}
                      onClick={() => setShowAll((v) => !v)}
                      variant="outlined"
                      sx={{ height: 42, fontSize: '0.78rem', color: 'text.secondary', borderColor: 'divider' }}
                    />
                  )}
                </Box>
              </Box>

              {/* 결제수단 */}
              {assets.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.75}>
                    결제수단
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    <Chip
                      label="없음" size="small"
                      onClick={() => setAssetId('')}
                      variant={!assetId ? 'filled' : 'outlined'}
                      sx={{ height: 30, fontSize: '0.76rem', color: 'text.secondary' }}
                    />
                    {assets.map((a) => (
                      <Chip
                        key={a.id} label={a.name} size="small"
                        onClick={() => setAssetId(assetId === String(a.id) ? '' : String(a.id))}
                        variant={assetId === String(a.id) ? 'filled' : 'outlined'}
                        sx={{
                          height: 30, fontSize: '0.76rem',
                          bgcolor: assetId === String(a.id) ? 'primary.main' : undefined,
                          color: assetId === String(a.id) ? 'primary.contrastText' : 'text.primary',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* 메모 + 날짜 */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField
                  placeholder="메모 (선택)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  size="small"
                  variant="outlined"
                  inputProps={{ maxLength: 100 }}
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.8 } }}
                />
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Chip
                    label={fmtDate(date)}
                    size="small"
                    onClick={() => dateRef.current?.click()}
                    sx={{ height: 32, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  />
                  <input
                    ref={dateRef}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: 1, height: 1, top: 0, left: 0, pointerEvents: 'none' }}
                  />
                </Box>
              </Stack>
            </Stack>
          ) : (
            /* ── 이체 폼 ── */
            <Stack spacing={2}>
              {/* 출금 */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.75}>출금 계좌</Typography>
                {assets.length === 0
                  ? <Typography variant="caption" color="text.disabled">자산을 먼저 등록해주세요</Typography>
                  : (
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                      {assets.map((a) => (
                        <Chip key={a.id} label={a.name} size="small"
                          onClick={() => setFromAsset(fromAsset === String(a.id) ? '' : String(a.id))}
                          variant={fromAsset === String(a.id) ? 'filled' : 'outlined'}
                          sx={{ height: 30, fontSize: '0.76rem', bgcolor: fromAsset === String(a.id) ? 'error.main' : undefined, color: fromAsset === String(a.id) ? '#fff' : 'text.primary' }}
                        />
                      ))}
                    </Stack>
                  )
                }
              </Box>

              {/* 입금 */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.75}>입금 계좌</Typography>
                {assets.length === 0
                  ? <Typography variant="caption" color="text.disabled">자산을 먼저 등록해주세요</Typography>
                  : (
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                      {assets.map((a) => (
                        <Chip key={a.id} label={a.name} size="small"
                          onClick={() => setToAsset(toAsset === String(a.id) ? '' : String(a.id))}
                          variant={toAsset === String(a.id) ? 'filled' : 'outlined'}
                          sx={{ height: 30, fontSize: '0.76rem', bgcolor: toAsset === String(a.id) ? 'success.main' : undefined, color: toAsset === String(a.id) ? '#fff' : 'text.primary' }}
                        />
                      ))}
                    </Stack>
                  )
                }
              </Box>

              {/* 메모 + 날짜 */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField
                  placeholder="메모 (선택)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.8 } }}
                />
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Chip
                    label={fmtDate(date)}
                    size="small"
                    onClick={() => dateRef.current?.click()}
                    sx={{ height: 32, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  />
                  <input
                    ref={dateRef}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: 1, height: 1, top: 0, left: 0, pointerEvents: 'none' }}
                  />
                </Box>
              </Stack>
            </Stack>
          )}
        </Box>

        {/* ── 키패드 + 저장 (하단 고정) ── */}
        <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <NumKeypad digits={activeDigits} onDigits={setActiveDigits} />

          <Box sx={{ px: 2, pt: 0.75, pb: isMobile ? 'max(env(safe-area-inset-bottom), 12px)' : 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={saving}
              sx={{
                py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2,
                bgcolor: tab === 'INCOME' ? 'info.main' : tab === 'EXPENSE' ? 'error.main' : 'primary.main',
                '&:hover': {
                  bgcolor: tab === 'INCOME' ? 'info.dark' : tab === 'EXPENSE' ? 'error.dark' : 'primary.dark',
                },
              }}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {isEdit ? '수정 완료' : tab === 'TRANSFER' ? '이체 저장' : '거래 저장'}
            </Button>
          </Box>
        </Box>

      </DialogContent>
    </Dialog>
  )
}
