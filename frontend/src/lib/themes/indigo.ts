// 💙 Indigo v3 (Ocean Blue) — 기본 테마 프리셋
// base hue: H=204° — #0277BD 기준 정렬. modern_redesign_guide §6 기준값.
import type { PresetTokens } from './types'

export const indigoTheme: PresetTokens = {
  primary: {
    // #0277BD — MUI Light Blue 800 (WCAG AA: 4.79:1 on white ✅)
    main: '#0277BD',
    // #E3F2FB — 약간 따뜻해진 틴트 (hover/selected/chip bg)
    light: '#E3F2FB',
    // #01579B — pressed/focus/active icon
    dark: '#01579B',
    contrastText: '#FFFFFF',
  },

  secondary: {
    main: '#0097A7',
    light: '#E0F7FA',
    dark: '#006064',
    contrastText: '#FFFFFF',
  },

  background: {
    // #EAF1F7 — 캔버스 (앱 전체 배경, 사이드바 외부)
    default: '#EAF1F7',
    paper: '#FFFFFF',
    sidebar: '#FFFFFF',
    // #DCE7F0 — 대형 화면 외곽·카드 내부 배경 구분용
    canvasDeep: '#DCE7F0',
  },

  text: {
    // #0E2438 — 딥 네이비 (배경과 대비 ≥14:1 ✅ AAA)
    primary: '#0E2438',
    // #3A5168 — 보조 텍스트 (날짜·설명)
    secondary: '#3A5168',
    // #7C93A6 — 3단계 힌트·라벨·플레이스홀더
    muted: '#7C93A6',
  },

  // #EAF0F5 — 아주 연한 구분선 (Divider, TableCell 하단)
  divider: '#EAF0F5',
  // #E0E8EF — 카드 테두리·보더 (divider보다 약간 진함)
  divider2: '#E0E8EF',
}
