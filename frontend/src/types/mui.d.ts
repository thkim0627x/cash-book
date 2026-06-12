// MUI 테마 타입 보강 — 커스텀 토큰 등록
import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface TypeBackground {
    /** 사이드바 배경색 (테마 프리셋별) */
    sidebar: string
    /** 캔버스보다 약간 깊은 배경 — 대형 화면 외곽/카드 내부 배경 구분용 */
    canvasDeep: string
  }
  interface TypeText {
    /** 3단계 텍스트: primary > secondary > muted (힌트·라벨·날짜) */
    muted: string
  }
  interface Palette {
    /** 카드 테두리 등 2차 구분선 (divider보다 약간 진함) */
    divider2: string
  }
  interface PaletteOptions {
    divider2?: string
  }
}
