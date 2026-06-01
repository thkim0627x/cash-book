import type { Metadata } from 'next'
import './globals.css'
import ThemeRegistry from '@/components/common/ThemeRegistry'
import { GlobalToast } from '@/components/common/GlobalToast'

export const metadata: Metadata = {
  title: '편한가계부',
  description: '스마트한 가계부 관리 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>
          {children}
          <GlobalToast />
        </ThemeRegistry>
      </body>
    </html>
  )
}
