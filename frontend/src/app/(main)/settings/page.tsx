'use client'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Stack,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Tag, SignOut, CaretRight } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/features/settings/ProfileForm'
import { PasswordForm } from '@/features/settings/PasswordForm'
import { ThemeSelector } from '@/features/settings/ThemeSelector'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { useToastStore } from '@/stores/toastStore'

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        {children}
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { clearAuth } = useAuthStore()
  const showToast = useToastStore((s) => s.show)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // 무시
    } finally {
      clearAuth()
      router.push('/login')
      showToast('로그아웃 되었습니다.', 'info')
    }
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        설정
      </Typography>

      <Stack spacing={3}>
        {/* 프로필 */}
        <SettingsSection title="프로필" description="닉네임과 출생연도를 변경할 수 있어요.">
          <ProfileForm />
        </SettingsSection>

        {/* 비밀번호 변경 */}
        <SettingsSection title="비밀번호 변경" description="주기적으로 비밀번호를 변경해 보안을 유지하세요.">
          <PasswordForm />
        </SettingsSection>

        {/* 테마 색상 */}
        <SettingsSection title="테마 색상" description="앱 전체에 적용되는 색상 테마를 선택하세요.">
          <ThemeSelector />
        </SettingsSection>

        {/* 카테고리 관리 진입 */}
        <SettingsSection title="카테고리 관리" description="수입·지출 카테고리를 직접 만들고 관리하세요.">
          <ListItemButton
            onClick={() => router.push('/categories')}
            sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', maxWidth: 420 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Tag size={22} />
            </ListItemIcon>
            <ListItemText
              primary="카테고리 관리"
              secondary="기본 카테고리 + 내 카테고리"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
            <CaretRight size={18} />
          </ListItemButton>
        </SettingsSection>

        {/* 로그아웃 */}
        <SettingsSection title="계정">
          <Button
            variant="outlined"
            color="error"
            startIcon={<SignOut size={18} />}
            onClick={handleLogout}
            sx={{ alignSelf: 'flex-start' }}
          >
            로그아웃
          </Button>
        </SettingsSection>
      </Stack>
    </Box>
  )
}
