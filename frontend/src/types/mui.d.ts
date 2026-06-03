// MUI 테마 타입 보강 — 커스텀 토큰 등록
import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface TypeBackground {
    /** 사이드바 배경색 (테마 프리셋별) */
    sidebar: string
  }
}
