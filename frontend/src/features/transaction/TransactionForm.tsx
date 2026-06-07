'use client'
import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent,
  Button, Stack, useMediaQuery, useTheme, CircularProgress,
  Typography, Box, IconButton, TextField,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { assetService } from '@/services/asset.service'
import { transactionService } from '@/services/transaction.service'
import { useToastStore } from '@/stores/toastStore'
import { X, CaretLeft, CaretRight, PencilSimple } from '@phosphor-icons/react'
import type { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/types/transaction'

type TxnTabType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
type ActiveField = 'date' | 'amount' | 'category' | 'asset' | 'fromAsset' | 'toAsset' | 'memo' | null

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
  const d = new Date(s + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${days[d.getDay()]})`
}

// ── NumKeypad ──────────────────────────────────────────────────────────────
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
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', bgcolor: 'grey.50' }}>
      {keys.map((k) => (
        <Button
          key={k}
          variant="text"
          onClick={() => handle(k)}
          sx={{
            py: { xs: 1.8, sm: 1.4 },
            fontSize: { xs: '1.3rem', sm: '1.15rem' },
            fontWeight: 600,
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

// ── DatePicker ─────────────────────────────────────────────────────────────
function DatePicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const [nav, setNav] = useState(() => {
    const d = new Date(value + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const { year, month } = nav
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = todayStr()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const makeStr = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const prevM = () => setNav(n => n.month === 0 ? { year: n.year - 1, month: 11 } : { ...n, month: n.month - 1 })
  const nextM = () => setNav(n => n.month === 11 ? { year: n.year + 1, month: 0 } : { ...n, month: n.month + 1 })

  return (
    <Box sx={{ px: 2, pt: 1, pb: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <IconButton size="small" onClick={prevM}><CaretLeft size={16} /></IconButton>
        <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>{year}년 {month + 1}월</Typography>
        <IconButton size="small" onClick={nextM}><CaretRight size={16} /></IconButton>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <Typography key={d} variant="caption" textAlign="center" fontWeight={600}
            color={i === 0 ? 'error.main' : i === 6 ? 'info.main' : 'text.secondary'}
            sx={{ py: 0.25, fontSize: '0.72rem' }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25 }}>
        {cells.map((d, i) => {
          if (d === null) return <Box key={`n-${i}`} />
          const str = makeStr(d)
          const isSel = value === str
          const isTod = today === str
          const dow = (firstDay + d - 1) % 7
          return (
            <Box
              key={d}
              onClick={() => onChange(str)}
              sx={{
                py: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', cursor: 'pointer',
                bgcolor: isSel ? 'error.main' : 'transparent',
                color: isSel ? '#fff' : dow === 0 ? 'error.main' : dow === 6 ? 'info.main' : 'text.primary',
                fontWeight: isSel || isTod ? 700 : 400,
                outline: isTod && !isSel ? '1.5px solid' : 'none',
                outlineColor: 'error.main',
                fontSize: '0.82rem',
                '&:hover': { bgcolor: isSel ? 'error.main' : 'action.hover' },
              }}
            >
              {d}
            </Box>
          )
        })}
      </Box>
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

  const [tab, setTab] = useState<TxnTabType>(
    isEdit ? (editTarget.type as TxnTabType) : (defaultType ?? 'EXPENSE')
  )
  const [digits, setDigits] = useState(isEdit ? String(editTarget.amount) : '')
  const [catId, setCatId] = useState<number | null>(editTarget?.categoryId ?? null)
  const [assetId, setAssetId] = useState<number | null>(editTarget?.assetId ?? null)
  const [fromAsset, setFromAsset] = useState<number | null>(null)
  const [toAsset, setToAsset] = useState<number | null>(null)
  const [memo, setMemo] = useState(editTarget?.memo ?? '')
  const [date, setDate] = useState(editTarget?.txnDate ?? todayStr())
  const [activeField, setActiveField] = useState<ActiveField>(null)

  useEffect(() => {
    if (open && !isEdit) {
      setTab(defaultType ?? 'EXPENSE')
      setDigits(''); setCatId(null); setAssetId(null)
      setFromAsset(null); setToAsset(null)
      setMemo(''); setDate(todayStr())
      setActiveField(null)
    }
  }, [open]) // eslint-disable-line

  const { data: catRes } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll, staleTime: Infinity })
  const { data: assetRes } = useQuery({ queryKey: ['assets'], queryFn: assetService.getAll, staleTime: Infinity })
  const allCats = catRes?.data ?? []
  const assets = assetRes?.data ?? []
  const typeCats = allCats.filter(c => tab !== 'TRANSFER' && c.type === tab && c.name !== '이체')
  const xferExpCat = allCats.find(c => c.name === '이체' && c.type === 'EXPENSE') ?? allCats.find(c => c.type === 'EXPENSE')
  const xferIncCat = allCats.find(c => c.name === '이체' && c.type === 'INCOME') ?? allCats.find(c => c.type === 'INCOME')

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

  const doSave = (continueAdding = false) => {
    const amount = Number(digits)
    if (!amount || amount < 1) { showToast('금액을 입력해주세요.', 'warning'); return }

    if (tab === 'TRANSFER') {
      if (!xferExpCat || !xferIncCat) { showToast('이체 카테고리가 없습니다.', 'error'); return }
      const m = memo || '이체'
      create({ type: 'EXPENSE', categoryId: xferExpCat.id, amount, txnDate: date, memo: m }, {
        onSuccess: () => create(
          { type: 'INCOME', categoryId: xferIncCat.id, amount, txnDate: date, memo: m },
          {
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
              showToast('이체가 등록되었습니다.', 'success')
              if (continueAdding) {
                setDigits(''); setFromAsset(null); setToAsset(null); setMemo(''); setActiveField(null)
              } else { onClose() }
            },
          }
        ),
      })
      return
    }

    if (!catId) { showToast('분류를 선택해주세요.', 'warning'); return }
    const payload = {
      categoryId: catId, amount, txnDate: date,
      memo: memo || undefined, assetId: assetId ?? undefined,
    }

    if (isEdit && editTarget) {
      update({ id: editTarget.id, data: { type: editTarget.type, ...payload } })
    } else {
      create({ type: tab as 'INCOME' | 'EXPENSE', ...payload }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
          showToast('등록되었습니다.', 'success')
          if (continueAdding) {
            setDigits(''); setCatId(null); setMemo(''); setActiveField(null)
          } else { onClose() }
        },
      })
    }
  }

  const tabColor = tab === 'INCOME' ? theme.palette.info.main : tab === 'EXPENSE' ? '#f44336' : theme.palette.primary.main
  const selCat = allCats.find(c => c.id === catId)
  const selAsset = assets.find(a => a.id === assetId)
  const selFrom = assets.find(a => a.id === fromAsset)
  const selTo = assets.find(a => a.id === toAsset)
  const displayAmt = digits ? Number(digits).toLocaleString('ko-KR') : ''

  const toggle = (f: ActiveField) => setActiveField(prev => prev === f ? null : f)

  // ── form row definitions ──
  const normalRows = [
    { key: 'date',     label: '날짜', value: fmtDate(date),   field: 'date'     as ActiveField },
    { key: 'amount',   label: '금액', value: displayAmt,       field: 'amount'   as ActiveField, accent: true },
    { key: 'category', label: '분류', value: selCat ? `${EMOJI[selCat.name] ?? ''} ${selCat.name}` : '', field: 'category' as ActiveField },
    { key: 'asset',    label: '자산', value: selAsset?.name ?? '', field: 'asset' as ActiveField },
    { key: 'memo',     label: '내용', value: memo,              field: 'memo'     as ActiveField },
  ]
  const transferRows = [
    { key: 'date',      label: '날짜',   value: fmtDate(date),   field: 'date'      as ActiveField },
    { key: 'amount',    label: '금액',   value: displayAmt,       field: 'amount'    as ActiveField, accent: true },
    { key: 'fromAsset', label: '출금계좌', value: selFrom?.name ?? '', field: 'fromAsset' as ActiveField },
    { key: 'toAsset',   label: '입금계좌', value: selTo?.name ?? '',   field: 'toAsset'   as ActiveField },
    { key: 'memo',      label: '내용',   value: memo,              field: 'memo'      as ActiveField },
  ]
  const rows = tab === 'TRANSFER' ? transferRows : normalRows

  const panelLabel: Record<string, string> = {
    date: '날짜', amount: '금액', category: '분류', asset: '자산',
    fromAsset: '출금계좌', toAsset: '입금계좌', memo: '내용',
  }

  const gridItemSx = (sel: boolean) => ({
    py: 1.5, px: 0.5, textAlign: 'center' as const, cursor: 'pointer',
    borderRadius: 1.5,
    bgcolor: sel ? `${tabColor}20` : 'grey.50',
    border: '1px solid',
    borderColor: sel ? tabColor : 'transparent',
    '&:hover': { bgcolor: `${tabColor}15` },
  })

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
          height: isMobile ? '100dvh' : '90vh',
          maxHeight: isMobile ? '100dvh' : '90vh',
          borderRadius: isMobile ? 0 : 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── 탭 + 닫기 ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
          {(['INCOME', 'EXPENSE', 'TRANSFER'] as TxnTabType[]).map((t) => {
            const sel = tab === t
            const label = { INCOME: '수입', EXPENSE: '지출', TRANSFER: '이체' }[t]
            const c = { INCOME: theme.palette.info.main, EXPENSE: '#f44336', TRANSFER: theme.palette.primary.main }[t]
            return (
              <Button
                key={t}
                onClick={() => { if (!isEdit) { setTab(t); setCatId(null); setActiveField(null) } }}
                disabled={isEdit && t !== tab}
                sx={{
                  flex: 1, py: 1.5, borderRadius: 0, fontWeight: 700, fontSize: '0.9rem',
                  color: sel ? c : 'text.secondary',
                  borderBottom: sel ? `2.5px solid ${c}` : '2.5px solid transparent',
                  '&.Mui-disabled': { opacity: 0.3 },
                }}
              >
                {label}
              </Button>
            )
          })}
          <IconButton size="small" onClick={onClose} sx={{ mx: 1, flexShrink: 0 }}>
            <X size={18} />
          </IconButton>
        </Box>

        {/* ── 폼 행 목록 ── */}
        <Box sx={{ flexShrink: 0 }}>
          {rows.map(({ key, label, value, field, accent }) => {
            const isActive = activeField === field
            return (
              <Box
                key={key}
                onClick={() => toggle(field)}
                sx={{
                  display: 'flex', alignItems: 'center',
                  px: 2.5, minHeight: 52,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: isActive ? tabColor : 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography
                  variant="body2" fontWeight={600} color="text.secondary"
                  sx={{ minWidth: 68, flexShrink: 0, fontSize: '0.85rem' }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="body2"
                  color={accent && value ? tabColor : value ? 'text.primary' : 'text.disabled'}
                  fontWeight={accent && value ? 700 : 400}
                  sx={{ flex: 1, fontSize: accent ? '1rem' : '0.88rem' }}
                >
                  {value || ''}
                </Typography>
              </Box>
            )
          })}
        </Box>

        {/* ── 여백 ── */}
        <Box sx={{ flex: 1, minHeight: 0 }} />

        {/* ── 하단 컨텍스트 패널 ── */}
        {activeField && (
          <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* 다크 헤더 */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2, py: 1.2, bgcolor: '#1a1a1a',
            }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography fontWeight={700} color="#fff" sx={{ fontSize: '0.88rem' }}>
                  {panelLabel[activeField]}
                </Typography>
                {activeField === 'category' && (
                  <IconButton size="small" sx={{ color: '#888', p: 0.5 }}>
                    <PencilSimple size={14} />
                  </IconButton>
                )}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {activeField === 'date' && (
                  <Button
                    size="small"
                    onClick={() => setDate(todayStr())}
                    sx={{ color: '#aaa', fontSize: '0.75rem', py: 0.25, minWidth: 0 }}
                  >
                    오늘
                  </Button>
                )}
                <IconButton size="small" sx={{ color: '#888' }} onClick={() => setActiveField(null)}>
                  <X size={15} />
                </IconButton>
              </Stack>
            </Box>

            {/* 금액 → 키패드 */}
            {activeField === 'amount' && (
              <NumKeypad digits={digits} onDigits={setDigits} />
            )}

            {/* 분류 → 카테고리 그리드 */}
            {activeField === 'category' && (
              <Box sx={{ px: 1.5, py: 1.5, maxHeight: 264, overflowY: 'auto' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {typeCats.map((cat) => {
                    const sel = catId === cat.id
                    return (
                      <Box key={cat.id} onClick={() => { setCatId(cat.id); setActiveField(null) }} sx={gridItemSx(sel)}>
                        <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, mb: 0.5 }}>
                          {EMOJI[cat.name] ?? '📦'}
                        </Typography>
                        <Typography variant="caption" fontWeight={sel ? 700 : 400}
                          color={sel ? tabColor : 'text.primary'}
                          sx={{ fontSize: '0.7rem', lineHeight: 1.2, display: 'block' }}
                        >
                          {cat.name}
                        </Typography>
                      </Box>
                    )
                  })}
                  <Box sx={gridItemSx(false)}>
                    <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, mb: 0.5 }}>➕</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>추가</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* 자산 / 출금계좌 / 입금계좌 → 자산 그리드 */}
            {(activeField === 'asset' || activeField === 'fromAsset' || activeField === 'toAsset') && (
              <Box sx={{ px: 1.5, py: 1.5, maxHeight: 264, overflowY: 'auto' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {activeField === 'asset' && (
                    <Box onClick={() => { setAssetId(null); setActiveField(null) }} sx={gridItemSx(assetId === null)}>
                      <Typography variant="caption" fontWeight={assetId === null ? 700 : 400}
                        color={assetId === null ? tabColor : 'text.primary'}
                        sx={{ fontSize: '0.82rem' }}
                      >
                        없음
                      </Typography>
                    </Box>
                  )}
                  {assets.map((a) => {
                    const cur = activeField === 'fromAsset' ? fromAsset : activeField === 'toAsset' ? toAsset : assetId
                    const isSel = cur === a.id
                    return (
                      <Box
                        key={a.id}
                        onClick={() => {
                          if (activeField === 'fromAsset') { setFromAsset(a.id); setActiveField(null) }
                          else if (activeField === 'toAsset') { setToAsset(a.id); setActiveField(null) }
                          else { setAssetId(isSel ? null : a.id); setActiveField(null) }
                        }}
                        sx={gridItemSx(isSel)}
                      >
                        <Typography variant="caption" fontWeight={isSel ? 700 : 400}
                          color={isSel ? tabColor : 'text.primary'}
                          sx={{ fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}
                        >
                          {a.name}
                        </Typography>
                      </Box>
                    )
                  })}
                  <Box sx={gridItemSx(false)}>
                    <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, mb: 0.5 }}>➕</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>추가</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* 날짜 → 캘린더 */}
            {activeField === 'date' && (
              <DatePicker value={date} onChange={(d) => setDate(d)} />
            )}

            {/* 내용 → 텍스트 입력 */}
            {activeField === 'memo' && (
              <Box sx={{ px: 2, py: 1.5 }}>
                <TextField
                  fullWidth autoFocus multiline rows={3}
                  placeholder="내용을 입력하세요"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  inputProps={{ maxLength: 200 }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setActiveField(null) } }}
                />
                <Button size="small" onClick={() => setActiveField(null)} sx={{ mt: 1 }}>완료</Button>
              </Box>
            )}
          </Box>
        )}

        {/* ── 저장 버튼 ── */}
        <Box sx={{
          flexShrink: 0, px: 2, pt: 1.25,
          pb: isMobile ? 'max(env(safe-area-inset-bottom), 16px)' : 1.5,
          borderTop: '1px solid', borderColor: 'divider',
          display: 'flex', gap: 1,
        }}>
          {!isEdit && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => doSave(true)}
              disabled={saving}
              sx={{ flex: '0 0 auto', px: 3, py: 1.5, fontWeight: 700, borderRadius: 2 }}
            >
              계속
            </Button>
          )}
          <Button
            fullWidth variant="contained" size="large"
            onClick={() => doSave(false)}
            disabled={saving}
            sx={{
              py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2,
              bgcolor: tabColor,
              '&:hover': { filter: 'brightness(0.88)' },
            }}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {isEdit ? '수정 완료' : tab === 'TRANSFER' ? '이체 저장' : '저장'}
          </Button>
        </Box>

      </DialogContent>
    </Dialog>
  )
}
