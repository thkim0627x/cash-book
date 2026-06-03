// 테마 프리셋 토큰 구조 정의
export interface PresetTokens {
  primary: {
    main: string
    light: string
    dark: string
    contrastText: string
  }
  secondary: {
    main: string
    light: string
    dark: string
    contrastText: string
  }
  background: {
    default: string
    paper: string
    sidebar: string
  }
  text: {
    primary: string
    secondary: string
  }
  divider: string
}
