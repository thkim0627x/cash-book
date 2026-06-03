'use client'
import { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Alert,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Fab,
  Chip,
} from '@mui/material'
import { PencilSimple, Trash, Plus } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { categoryService } from '@/services/category.service'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { TransactionTypeChip } from '@/components/common/TransactionTypeChip'
import { AmountText } from '@/components/common/AmountText'
import { MonthPicker } from '@/components/common/MonthPicker'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useToastStore } from '@/stores/toastStore'
import type { Transaction } from '@/types/transaction'
import type { TransactionType } from '@/types/category'
import { PageHeader } from '@/components/common/PageHeader'

// 날짜 포매터
function fmtDate(dateStr: string) {
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
}

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50]

export default function TransactionsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // ── 데이터 패칭 ──────────────────────────────────────────────────
  const { data: txnRes, isLoading, isError } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: Infinity,
  })

  const allTransactions = txnRes?.data?.content ?? []
  const categories = catRes?.data ?? []

  // ── 클라이언트 필터링 ────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = allTransactions
    if (typeFilter !== 'ALL') list = list.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'ALL') list = list.filter((t) => String(t.categoryId) === categoryFilter)
    return list
  }, [allTransactions, typeFilter, categoryFilter])

  // 페이지네이션
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // 집계
  const summary = transactionService.getSummary(filtered)

  // ── 삭제 ─────────────────────────────────────────────────────────
  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['transactions', year, month] })
      showToast('거래내역이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  // ── 월 변경 시 페이지 초기화 ─────────────────────────────────────
  const handleMonthChange = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
    setPage(0)
  }

  // ── 필터 변경 시 페이지 초기화 ───────────────────────────────────
  const handleTypeFilter = (_: React.SyntheticEvent, val: 'ALL' | TransactionType) => {
    setTypeFilter(val)
    setCategoryFilter('ALL')
    setPage(0)
  }

  const handleCategoryFilter = (val: string) => {
    setCategoryFilter(val)
    setPage(0)
  }

  // 수정 버튼 클릭
  const handleEditClick = (txn: Transaction) => {
    setEditTarget(txn)
    setFormOpen(true)
  }

  // 모달 닫기
  const handleFormClose = () => {
    setFormOpen(false)
    setEditTarget(null)
  }

  // 해당 타입의 카테고리만 필터 옵션에 표시
  const categoryOptions = useMemo(() => {
    if (typeFilter === 'ALL') return categories
    return categories.filter((c) => c.type === typeFilter)
  }, [categories, typeFilter])

  // ── 렌더 ─────────────────────────────────────────────────────────
  return (
    <Box>
      <PageHeader
        title="거래 내역"
        action={!isMobile ? { label: '거래 추가', onClick: () => setFormOpen(true) } : undefined}
      />

      {/* ── 필터 영역 ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          {/* 월 선택 */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <MonthPicker year={year} month={month} onChange={handleMonthChange} />

            {/* 집계 요약 */}
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">
                수입{' '}
                <Typography component="span" variant="body2" color="success.main" fontWeight={700}>
                  +{summary.totalIncome.toLocaleString('ko-KR')}원
                </Typography>
              </Typography>
              <Typography variant="body2">
                지출{' '}
                <Typography component="span" variant="body2" color="error.main" fontWeight={700}>
                  -{summary.totalExpense.toLocaleString('ko-KR')}원
                </Typography>
              </Typography>
              <Typography variant="body2">
                잔액{' '}
                <Typography component="span" variant="body2" color="primary.main" fontWeight={700}>
                  {summary.balance.toLocaleString('ko-KR')}원
                </Typography>
              </Typography>
            </Stack>
          </Stack>

          {/* 유형 탭 + 카테고리 셀렉트 */}
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2}>
            <Tabs
              value={typeFilter}
              onChange={handleTypeFilter}
              sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
            >
              <Tab label="전체" value="ALL" />
              <Tab
                label="수입"
                value="INCOME"
                sx={{ color: 'success.main', '&.Mui-selected': { color: 'success.main' } }}
              />
              <Tab
                label="지출"
                value="EXPENSE"
                sx={{ color: 'error.main', '&.Mui-selected': { color: 'error.main' } }}
              />
            </Tabs>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={categoryFilter}
                label="카테고리"
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                <MenuItem value="ALL">전체</MenuItem>
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Chip
              label={`${filtered.length}건`}
              size="small"
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ── 에러 ── */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* ── 목록 ── */}
      <Card>
        {isLoading ? (
          <CardContent>
            <ListSkeleton rows={8} />
          </CardContent>
        ) : filtered.length === 0 ? (
          <CardContent>
            <EmptyState
              message="조건에 맞는 거래내역이 없습니다."
              actionLabel="거래 추가"
              onAction={() => setFormOpen(true)}
            />
          </CardContent>
        ) : isMobile ? (
          /* ── 모바일: List ── */
          <>
            <List disablePadding>
              {paginated.map((txn, idx) => (
                <Box key={txn.id}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItem
                    sx={{ px: 2, py: 1.5 }}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="수정">
                          <IconButton size="small" onClick={() => handleEditClick(txn)}>
                            <PencilSimple size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            sx={{ color: 'error.main' }}
                            onClick={() => setDeleteTarget(txn.id)}
                          >
                            <Trash size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor:
                            txn.categoryColor ??
                            (txn.type === 'INCOME' ? 'success.light' : 'error.light'),
                          fontSize: '0.8rem',
                        }}
                      >
                        {txn.categoryName?.slice(0, 1)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TransactionTypeChip type={txn.type} />
                          <Typography variant="body2" fontWeight={500}>
                            {txn.categoryName}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" color="text.secondary">
                            {fmtDate(txn.txnDate)}
                          </Typography>
                          {txn.memo && (
                            <Typography variant="caption" color="text.secondary">
                              {' · '}
                              {txn.memo}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <AmountText
                      amount={txn.amount}
                      type={txn.type === 'INCOME' ? 'income' : 'expense'}
                      variant="body2"
                      sx={{ ml: 1, whiteSpace: 'nowrap', mr: 8 }}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(0)
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="행 수"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
            />
          </>
        ) : (
          /* ── 데스크톱: Table ── */
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell width={110} sx={{ fontWeight: 600 }}>날짜</TableCell>
                    <TableCell width={80} sx={{ fontWeight: 600 }}>유형</TableCell>
                    <TableCell width={130} sx={{ fontWeight: 600 }}>카테고리</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>메모</TableCell>
                    <TableCell width={150} align="right" sx={{ fontWeight: 600 }}>금액</TableCell>
                    <TableCell width={90} align="center" sx={{ fontWeight: 600 }}>관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((txn) => (
                    <TableRow
                      key={txn.id}
                      hover
                      sx={{
                        bgcolor:
                          txn.type === 'INCOME'
                            ? 'rgba(232,245,233,0.3)'
                            : 'rgba(255,235,238,0.3)',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      {/* 날짜 */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {fmtDate(txn.txnDate)}
                        </Typography>
                      </TableCell>

                      {/* 유형 */}
                      <TableCell>
                        <TransactionTypeChip type={txn.type} />
                      </TableCell>

                      {/* 카테고리 */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: txn.categoryColor ?? '#e0e0e0',
                              fontSize: '0.7rem',
                            }}
                          >
                            {txn.categoryName?.slice(0, 1)}
                          </Avatar>
                          <Typography variant="body2">{txn.categoryName}</Typography>
                        </Stack>
                      </TableCell>

                      {/* 메모 */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={txn.memo ? 'text.primary' : 'text.disabled'}
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {txn.memo || '—'}
                        </Typography>
                      </TableCell>

                      {/* 금액 */}
                      <TableCell align="right">
                        <AmountText
                          amount={txn.amount}
                          type={txn.type === 'INCOME' ? 'income' : 'expense'}
                          variant="body2"
                        />
                      </TableCell>

                      {/* 관리 */}
                      <TableCell align="center">
                        <Tooltip title="수정">
                          <IconButton size="small" onClick={() => handleEditClick(txn)}>
                            <PencilSimple size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            sx={{ color: 'error.main' }}
                            onClick={() => setDeleteTarget(txn.id)}
                          >
                            <Trash size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(0)
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="행 수"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
            />
          </>
        )}
      </Card>

      {/* 모바일 FAB */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setFormOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
        >
          <Plus weight="bold" size={24} />
        </Fab>
      )}

      {/* 거래 등록/수정 모달 — key로 open/editTarget 변경 시 폼 초기값 반영 */}
      <TransactionForm
        key={`${editTarget?.id ?? 'new'}-${formOpen}`}
        open={formOpen}
        onClose={handleFormClose}
        defaultYear={year}
        defaultMonth={month}
        editTarget={editTarget}
      />

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="거래내역 삭제"
        description="이 거래내역을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        loading={isDeleting}
        onConfirm={() => deleteTarget !== null && deleteTxn(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
