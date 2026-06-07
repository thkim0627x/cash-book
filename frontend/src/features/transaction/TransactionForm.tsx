'use client'
import { useState, useEffect, useMemo } from 'react'
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
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/types/transaction'
import { getCategoryIcon, AssetIcon } from './categoryIcons'

type TxnTabType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
type ActiveField = 'date' | 'amount' | 'category' | 'asset' | 'fromAsset' | 'toAsset' | null

// 편한가계부 기준 분류 순서
const EXPENSE_ORDER = ['식비', '교통/차량', '문화생활', '마트/편의점', '패션/미용', '생활용품', '주거/통신', '건강', '교육', '경조사/회비', '부모님', '기타']
const INCOME_ORDER  = ['월급', '부수입', '용돈', '상여', '금융소득', '기타']

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
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {keys.map((k) => (
        <Button
          key={k}
          variant="text"
          onClick={() => handle(k)}
          sx={{
            py: 1.75,
            fontSize: '1.35rem',
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

// ── DatePicker — 한 화면에 한 달 전체가 보이도록 컴팩트하게 ──────────────────
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
    <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
      {/* 월 네비게이터 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <IconButton size="small" onClick={prevM} sx={{ p: 0.5 }}><CaretLeft size={15} /></IconButton>
        <Typography fontWeight={700} sx={{ fontSize: '0.88rem' }}>{year}년 {month + 1}월</Typography>
        <IconButton size="small" onClick={nextM} sx={{ p: 0.5 }}><CaretRight size={15} /></IconButton>
      </Stack>

      {/* 요일 헤더 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.25 }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <Typography key={d} variant="caption" textAlign="center" fontWeight={700}
            color={i === 0 ? 'error.main' : i === 6 ? 'info.main' : 'text.secondary'}
            sx={{ fontSize: '0.68rem', py: 0.25 }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* 날짜 셀 — aspectRatio 1 (정사각형) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
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
                aspectRatio: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', cursor: 'pointer',
                bgcolor: isSel ? 'error.main' : 'transparent',
                color: isSel ? '#fff' : dow === 0 ? 'error.main' : dow === 6 ? 'info.main' : 'text.primary',
                fontWeight: isSel || isTod ? 700 : 400,
                outline: isTod && !isSel ? '2px solid' : 'none',
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

  // 편한가계부 기준 정렬
  const typeCats = useMemo(() => {
    const order = tab === 'INCOME' ? INCOME_ORDER : EXPENSE_ORDER
    return allCats
      .filter(c => tab !== 'TRANSFER' && c.type === tab && c.name !== '이체')
      .sort((a, b) => {
        const ai = order.indexOf(a.name)
        const bi = order.indexOf(b.name)
        if (ai === -1 && bi === -1) return 0
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
  }, [allCats, tab])

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

  const handleSave = () => {
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
              onClose()
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
          onClose()
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

  const normalRows = [
    { key: 'date',     label: '날짜', value: fmtDate(date),     field: 'date'     as ActiveField },
    { key: 'amount',   label: '금액', value: displayAmt,         field: 'amount'   as ActiveField, accent: true },
    { key: 'category', label: '분류', value: selCat?.name ?? '', field: 'category' as ActiveField },
    { key: 'asset',    label: '자산', value: selAsset?.name ?? '', field: 'asset'  as ActiveField },
  ]
  const transferRows = [
    { key: 'date',      label: '날짜',   value: fmtDate(date),     field: 'date'      as ActiveField },
    { key: 'amount',    label: '금액',   value: displayAmt,         field: 'amount'    as ActiveField, accent: true },
    { key: 'fromAsset', label: '출금계좌', value: selFrom?.name ?? '', field: 'fromAsset' as ActiveField },
    { key: 'toAsset',   label: '입금계좌', value: selTo?.name ?? '',   field: 'toAsset'   as ActiveField },
  ]
  const rows = tab === 'TRANSFER' ? transferRows : normalRows

  const panelLabel: Record<string, string> = {
    date: '날짜', amount: '금액', category: '분류', asset: '자산',
    fromAsset: '출금계좌', toAsset: '입금계좌',
  }

  const cardSx = (sel: boolean) => ({
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    gap: 0.75, py: 1.5, px: 0.5,
    cursor: 'pointer', borderRadius: 2,
    bgcolor: sel ? `${tabColor}18` : 'grey.50',
    border: '1.5px solid',
    borderColor: sel ? tabColor : 'transparent',
    transition: 'background-color 0.12s',
    '&:hover': { bgcolor: sel ? `${tabColor}28` : 'grey.100' },
  })

  // 다크 패널 헤더 (공통)
  const PanelHeader = ({ label, showToday }: { label: string; showToday?: boolean }) => (
    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, bgcolor: '#1a1a1a' }}>
      <Typography fontWeight={700} color="#fff" sx={{ fontSize: '0.9rem' }}>{label}</Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        {showToday && (
          <Button size="small" onClick={() => setDate(todayStr())} sx={{ color: '#bbb', fontSize: '0.75rem', py: 0.25, minWidth: 0 }}>
            오늘
          </Button>
        )}
        <Button size="small" onClick={() => setActiveField(null)} sx={{ color: '#bbb', fontSize: '0.75rem', py: 0.25, minWidth: 0 }}>
          닫기
        </Button>
      </Stack>
    </Box>
  )

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
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── 탭 ── */}
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
        </Box>

        {/* ── 폼 행 ── */}
        <Box sx={{ flexShrink: 0 }}>
          {rows.map(({ key, label, value, field, accent }) => {
            const isActive = activeField === field
            const CatIcon = key === 'category' && selCat ? getCategoryIcon(selCat.name) : null
            const showAssetIcon =
              (key === 'asset' && selAsset) ||
              (key === 'fromAsset' && selFrom) ||
              (key === 'toAsset' && selTo)

            return (
              <Box
                key={key}
                onClick={() => toggle(field)}
                sx={{
                  display: 'flex', alignItems: 'center',
                  px: 2.5, minHeight: 54,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: isActive ? tabColor : 'divider',
                  bgcolor: isActive ? `${tabColor}06` : 'transparent',
                  '&:hover': { bgcolor: `${tabColor}08` },
                }}
              >
                <Typography
                  variant="body2" fontWeight={600} color="text.secondary"
                  sx={{ minWidth: 72, flexShrink: 0, fontSize: '0.85rem' }}
                >
                  {label}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                  {CatIcon && <CatIcon size={15} color={tabColor} />}
                  {showAssetIcon && <AssetIcon size={15} color={theme.palette.text.secondary} />}
                  <Typography
                    variant="body2" noWrap
                    color={accent && value ? tabColor : value ? 'text.primary' : 'text.disabled'}
                    fontWeight={accent && value ? 700 : 400}
                    sx={{ fontSize: accent ? '1rem' : '0.88rem' }}
                  >
                    {value || ''}
                  </Typography>
                </Stack>
              </Box>
            )
          })}

          {/* 내용 — 인라인 TextField, 줌인 방지(font-size ≥ 16px) */}
          <Box sx={{
            display: 'flex', alignItems: 'center',
            px: 2.5, minHeight: 54,
            borderBottom: '1px solid', borderColor: 'divider',
          }}>
            <Typography
              variant="body2" fontWeight={600} color="text.secondary"
              sx={{ minWidth: 72, flexShrink: 0, fontSize: '0.85rem' }}
            >
              내용
            </Typography>
            <TextField
              placeholder="내용 (선택)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              variant="standard"
              inputProps={{ maxLength: 200, style: { fontSize: '16px' } }}
              onClick={() => setActiveField(null)}
              slotProps={{ input: { disableUnderline: true } }}
              sx={{ flex: 1, '& .MuiInputBase-input': { py: 0 } }}
            />
          </Box>
        </Box>

        {/* ── 여백 or 분류/자산/날짜 패널 (위→아래로 채움) ── */}
        {activeField && activeField !== 'amount' ? (
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid', borderColor: 'divider' }}>
            <PanelHeader label={panelLabel[activeField]} showToday={activeField === 'date'} />

            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
              {/* 분류 그리드 */}
              {activeField === 'category' && (
                <Box sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {typeCats.map((cat) => {
                      const sel = catId === cat.id
                      const Icon = getCategoryIcon(cat.name)
                      return (
                        <Box key={cat.id} onClick={() => { setCatId(cat.id); setActiveField(null) }} sx={cardSx(sel)}>
                          <Icon size={26} color={sel ? tabColor : theme.palette.text.secondary} weight={sel ? 'fill' : 'regular'} />
                          <Typography variant="caption"
                            fontWeight={sel ? 700 : 500}
                            color={sel ? tabColor : 'text.primary'}
                            sx={{ fontSize: '0.72rem', lineHeight: 1.3, textAlign: 'center' }}
                          >
                            {cat.name}
                          </Typography>
                        </Box>
                      )
                    })}
                    <Box sx={{ ...cardSx(false), color: 'text.disabled' }}>
                      <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>＋</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>추가</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* 자산 그리드 (없음 제거) */}
              {(activeField === 'asset' || activeField === 'fromAsset' || activeField === 'toAsset') && (
                <Box sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
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
                          sx={cardSx(isSel)}
                        >
                          <AssetIcon size={26} color={isSel ? tabColor : theme.palette.text.secondary} weight={isSel ? 'fill' : 'regular'} />
                          <Typography variant="caption" fontWeight={isSel ? 700 : 500}
                            color={isSel ? tabColor : 'text.primary'}
                            sx={{ fontSize: '0.72rem', lineHeight: 1.3, textAlign: 'center', wordBreak: 'keep-all' }}
                          >
                            {a.name}
                          </Typography>
                        </Box>
                      )
                    })}
                    <Box sx={{ ...cardSx(false), color: 'text.disabled' }}>
                      <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>＋</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>추가</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* 날짜 캘린더 */}
              {activeField === 'date' && <DatePicker value={date} onChange={(d) => setDate(d)} />}
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {/* ── 금액 키패드 — 하단 고정, 빈 여백 없음 ── */}
        {activeField === 'amount' && (
          <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}>
            <PanelHeader label="금액" />
            <NumKeypad digits={digits} onDigits={setDigits} />
          </Box>
        )}

        {/* ── 취소 + 저장 버튼 ── */}
        <Box sx={{
          flexShrink: 0, px: 2, pt: 1.25,
          pb: isMobile ? 'max(env(safe-area-inset-bottom), 16px)' : 1.5,
          borderTop: '1px solid', borderColor: 'divider',
          display: 'flex', gap: 1,
        }}>
          <Button
            variant="outlined" size="large"
            onClick={onClose}
            sx={{ flex: '0 0 auto', px: 3, py: 1.5, fontWeight: 700, borderRadius: 2, color: 'text.secondary', borderColor: 'divider' }}
          >
            취소
          </Button>
          <Button
            fullWidth variant="contained" size="large"
            onClick={handleSave}
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
