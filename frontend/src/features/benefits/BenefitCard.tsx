import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
} from '@mui/material'
import { ArrowSquareOut, MapPin, Buildings, Clock } from '@phosphor-icons/react/dist/ssr'
import type { Benefit, BenefitCategory } from '@/types/benefit'

// ── D-day 계산 ──────────────────────────────────────────────────────
function calcDday(deadline: string | null): {
  label: string
  color: 'error' | 'warning' | 'default' | 'success'
} {
  if (!deadline) return { label: '상시모집', color: 'success' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(deadline)
  end.setHours(0, 0, 0, 0)
  const diff = Math.floor((end.getTime() - today.getTime()) / 86_400_000)

  if (diff < 0) return { label: '마감', color: 'default' }
  if (diff === 0) return { label: 'D-Day', color: 'error' }
  if (diff <= 7) return { label: `D-${diff}`, color: 'error' }
  if (diff <= 30) return { label: `D-${diff}`, color: 'warning' }
  return { label: `D-${diff}`, color: 'default' }
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 마감`
}

// ── 카테고리 색상 ───────────────────────────────────────────────────
const CATEGORY_STYLE: Record<
  BenefitCategory,
  { bgcolor: string; color: string; label: string }
> = {
  주거: { bgcolor: '#E3F2FD', color: '#1565C0', label: '🏠 주거' },
  취업: { bgcolor: '#E8F5E9', color: '#2E7D32', label: '💼 취업' },
  복지: { bgcolor: '#FFF3E0', color: '#E65100', label: '🤝 복지' },
  금융: { bgcolor: '#F3E5F5', color: '#6A1B9A', label: '💰 금융' },
}

interface BenefitCardProps {
  benefit: Benefit
}

export function BenefitCard({ benefit }: BenefitCardProps) {
  const dday = calcDday(benefit.deadline)
  const deadlineStr = formatDeadline(benefit.deadline)
  const catStyle = CATEGORY_STYLE[benefit.category]
  const isClosed = dday.label === '마감'

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isClosed ? 0.6 : 1,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: isClosed ? undefined : 4 },
      }}
    >
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        {/* 상단: 카테고리 + D-day + NEW 뱃지 */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={catStyle.label}
            size="small"
            sx={{
              bgcolor: catStyle.bgcolor,
              color: catStyle.color,
              fontWeight: 700,
              fontSize: '11px',
              height: 22,
            }}
          />
          <Chip
            label={dday.label}
            size="small"
            color={dday.color === 'default' ? undefined : dday.color}
            variant={dday.color === 'default' ? 'outlined' : 'filled'}
            sx={{ fontWeight: 700, fontSize: '11px', height: 22 }}
          />
          {benefit.isNew && (
            <Chip
              label="NEW"
              size="small"
              sx={{
                bgcolor: '#3F51B5',
                color: '#fff',
                fontWeight: 700,
                fontSize: '10px',
                height: 20,
              }}
            />
          )}
        </Stack>

        {/* 제목 */}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ mb: 0.75, lineHeight: 1.4, color: isClosed ? 'text.disabled' : 'text.primary' }}
        >
          {benefit.title}
        </Typography>

        {/* 혜택 내용 강조 */}
        <Typography
          variant="body2"
          color="primary.main"
          fontWeight={600}
          sx={{ mb: 1 }}
        >
          {benefit.benefit}
        </Typography>

        {/* 설명 */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {benefit.description}
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* 메타 정보 */}
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Buildings size={13} color="#757575" />
            <Typography variant="caption" color="text.secondary">
              {benefit.host}
            </Typography>
          </Stack>

          {benefit.targetRegion && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <MapPin size={13} color="#757575" />
              <Typography variant="caption" color="text.secondary">
                {benefit.targetRegion}
              </Typography>
            </Stack>
          )}

          {deadlineStr && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Clock size={13} color={dday.color === 'error' ? '#C62828' : '#757575'} />
              <Typography
                variant="caption"
                color={dday.color === 'error' ? 'error.main' : 'text.secondary'}
                fontWeight={dday.color === 'error' ? 600 : 400}
              >
                {deadlineStr}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>

      {/* 신청 버튼 */}
      <CardActions sx={{ px: 2.5, pb: 2, pt: 0 }}>
        <Button
          variant={isClosed ? 'outlined' : 'contained'}
          size="small"
          fullWidth
          disabled={isClosed}
          endIcon={<ArrowSquareOut size={14} />}
          href={benefit.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          component="a"
          sx={{ fontWeight: 600 }}
        >
          {isClosed ? '마감된 혜택' : '신청하기'}
        </Button>
      </CardActions>
    </Card>
  )
}
