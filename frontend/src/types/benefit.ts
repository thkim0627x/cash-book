export type BenefitCategory = '주거' | '취업' | '복지' | '금융'

export interface Benefit {
  id: number
  title: string
  description: string
  category: BenefitCategory
  host: string           // 주관 기관 (예: 국토교통부, 고용노동부)
  benefit: string        // 혜택 내용 요약 (예: 최대 300만원 지원)
  applyUrl: string       // 신청 외부 링크
  deadline: string | null // 'YYYY-MM-DD' — null 이면 상시
  targetAgeMin: number | null
  targetAgeMax: number | null
  targetIncome: string | null // 소득 기준 (예: '중위소득 150% 이하')
  targetRegion: string | null // 지역 제한 (null = 전국)
  isNew: boolean         // 신규 등록 혜택
  viewCount: number
}

export interface BenefitConditions {
  incomeLevel: IncomeLevelKey    // 소득 구간
  employmentStatus: EmploymentStatusKey
  region: string
}

export type IncomeLevelKey =
  | 'UNDER_500'       // 50만원 미만
  | '500_TO_1000'     // 50~100만원
  | '1000_TO_2000'    // 100~200만원
  | 'OVER_2000'       // 200만원 이상

export type EmploymentStatusKey =
  | 'UNEMPLOYED'      // 미취업
  | 'EMPLOYED'        // 재직중
  | 'FREELANCER'      // 프리랜서/단기
  | 'SELF_EMPLOYED'   // 창업/자영업

export const INCOME_LABELS: Record<IncomeLevelKey, string> = {
  UNDER_500: '50만원 미만',
  '500_TO_1000': '50 ~ 100만원',
  '1000_TO_2000': '100 ~ 200만원',
  OVER_2000: '200만원 이상',
}

export const EMPLOYMENT_LABELS: Record<EmploymentStatusKey, string> = {
  UNEMPLOYED: '미취업',
  EMPLOYED: '재직중',
  FREELANCER: '프리랜서 / 단기근로',
  SELF_EMPLOYED: '창업 / 자영업',
}

export const REGIONS = [
  '전국', '서울', '경기', '인천',
  '부산', '대구', '대전', '광주', '울산',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const

export type RegionKey = typeof REGIONS[number]
