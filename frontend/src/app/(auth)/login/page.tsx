import { cookies } from 'next/headers'
import { LoginForm } from '@/features/auth/LoginForm'

// Server Component — 쿠키에서 UI 초기상태 읽어 props로 주입 (hydration flicker 방지)
export default async function LoginPage() {
  const c = await cookies()
  const savedEmail = c.get('saved_email')?.value ?? ''
  const lastMethod = c.get('last_login_method')?.value ?? null

  return <LoginForm initialEmail={savedEmail} initialLastMethod={lastMethod} />
}
