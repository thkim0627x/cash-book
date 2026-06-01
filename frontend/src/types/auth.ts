export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  birthYear: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: number
  email: string
  name: string
  birthYear: number | null
  role: string
}
