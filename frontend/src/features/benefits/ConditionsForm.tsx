'use client'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { benefitService } from '@/services/benefit.service'
import { useToastStore } from '@/stores/toastStore'
import {
  type BenefitConditions,
  type IncomeLevelKey,
  type EmploymentStatusKey,
  INCOME_LABELS,
  EMPLOYMENT_LABELS,
  REGIONS,
} from '@/types/benefit'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'

export function ConditionsForm() {
  const router = useRouter()
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  // 기존 조건 불러오기
  const { data: condRes, isLoading: isCondLoading } = useQuery({
    queryKey: ['benefitConditions'],
    queryFn: benefitService.getConditions,
  })
  const savedConditions = condRes?.data

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BenefitConditions>({
    defaultValues: {
      incomeLevel: savedConditions?.incomeLevel ?? 'UNDER_500',
      employmentStatus: savedConditions?.employmentStatus ?? 'UNEMPLOYED',
      region: savedConditions?.region ?? '전국',
    },
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: BenefitConditions) => benefitService.saveConditions(data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['benefitConditions'] })
      queryClientInstance.invalidateQueries({ queryKey: ['benefits'] })
      showToast('조건이 저장되었습니다. 맞춤 혜택을 확인하세요!', 'success')
      router.push('/benefits')
    },
    onError: () => showToast('저장에 실패했습니다.', 'error'),
  })

  const incomeLevelKeys = Object.keys(INCOME_LABELS) as IncomeLevelKey[]
  const employmentKeys = Object.keys(EMPLOYMENT_LABELS) as EmploymentStatusKey[]

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => router.push('/benefits')}
          sx={{ mb: 1.5, color: 'text.secondary' }}
          size="small"
        >
          혜택 목록으로
        </Button>
        <Typography variant="h5" fontWeight={700}>
          내 조건 설정
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          조건을 입력하면 나에게 맞는 청년 혜택을 추천해 드려요.
        </Typography>
      </Box>

      {isCondLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit((data) => save(data))}>
          <Stack spacing={3}>
            {/* 소득 구간 */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '1rem',
                      mb: 0.5,
                      '&.Mui-focused': { color: 'text.primary' },
                    }}
                  >
                    월 소득 구간
                  </FormLabel>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    세전 기준 평균 월 소득을 선택해주세요.
                  </Typography>
                  <Controller
                    name="incomeLevel"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <RadioGroup {...field}>
                        <Stack spacing={0.5}>
                          {incomeLevelKeys.map((key) => (
                            <FormControlLabel
                              key={key}
                              value={key}
                              control={<Radio size="small" />}
                              label={
                                <Typography variant="body2">
                                  {INCOME_LABELS[key]}
                                </Typography>
                              }
                              sx={{
                                m: 0,
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor:
                                  field.value === key ? 'primary.main' : 'grey.200',
                                bgcolor:
                                  field.value === key ? 'primary.light' : 'transparent',
                                transition: 'all 0.15s',
                              }}
                            />
                          ))}
                        </Stack>
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </CardContent>
            </Card>

            {/* 취업 상태 */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '1rem',
                      mb: 0.5,
                      '&.Mui-focused': { color: 'text.primary' },
                    }}
                  >
                    취업 상태
                  </FormLabel>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    현재 취업 상태를 선택해주세요.
                  </Typography>
                  <Controller
                    name="employmentStatus"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <RadioGroup {...field}>
                        <Stack spacing={0.5}>
                          {employmentKeys.map((key) => (
                            <FormControlLabel
                              key={key}
                              value={key}
                              control={<Radio size="small" />}
                              label={
                                <Typography variant="body2">
                                  {EMPLOYMENT_LABELS[key]}
                                </Typography>
                              }
                              sx={{
                                m: 0,
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor:
                                  field.value === key ? 'primary.main' : 'grey.200',
                                bgcolor:
                                  field.value === key ? 'primary.light' : 'transparent',
                                transition: 'all 0.15s',
                              }}
                            />
                          ))}
                        </Stack>
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </CardContent>
            </Card>

            {/* 지역 */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 0.5 }}
                >
                  거주 지역
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  지역 특화 혜택을 찾는 데 사용됩니다.
                </Typography>
                <Controller
                  name="region"
                  control={control}
                  rules={{ required: '지역을 선택해주세요.' }}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.region}>
                      <InputLabel>지역 선택</InputLabel>
                      <Select {...field} label="지역 선택">
                        {REGIONS.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </CardContent>
            </Card>

            {/* 안내 */}
            <Alert severity="info" icon={<CheckCircle size={18} />} variant="outlined">
              입력한 조건은 언제든지 수정할 수 있으며, 혜택 추천에만 사용됩니다.
            </Alert>

            <Divider />

            {/* 저장 버튼 */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <CheckCircle size={18} />}
            >
              {isPending ? '저장 중…' : '조건 저장 후 혜택 보기'}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  )
}
