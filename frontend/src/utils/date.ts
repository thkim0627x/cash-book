/** ISO 문자열 → 상대 시간 (예: "3분 전", "2일 전") */
export function relativeTime(iso: string): string {
  const now = Date.now()
  const past = new Date(iso).getTime()
  const diff = Math.floor((now - past) / 1000) // 초

  if (diff < 60) return `${diff}초 전`
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}일 전`
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}개월 전`
  return `${Math.floor(diff / (86400 * 365))}년 전`
}

/** ISO 문자열 → 'YYYY.MM.DD' */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
