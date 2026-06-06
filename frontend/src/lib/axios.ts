import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

function getToken(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

function setToken(key: string, value: string) {
  if (typeof window === 'undefined') return
  const persistent = localStorage.getItem('autoLogin') !== '0'
  const storage = persistent ? localStorage : sessionStorage
  storage.setItem(key, value)
}

// 요청 인터셉터 — accessToken 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = getToken('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답 인터셉터 — 401 시 토큰 재발급 → 재시도, 실패 시 /login 이동
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = getToken('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reissue`,
          null,
          { headers: { 'Refresh-Token': refreshToken } }
        )
        const newAccessToken: string = res.data.data.accessToken
        const newRefreshToken: string | undefined = res.data.data.refreshToken

        setToken('accessToken', newAccessToken)
        if (newRefreshToken) setToken('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
