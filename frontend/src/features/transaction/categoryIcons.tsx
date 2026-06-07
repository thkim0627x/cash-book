import {
  Wallet, Gift, Trophy, TrendUp, CurrencyDollar,
  ForkKnife, Car, FilmStrip, ShoppingCart, Scissors,
  Package, House, Heart, BookOpen, Star,
  Users, DotsThree, ArrowsLeftRight, Shield, ChartLineUp,
  Tag, Bank,
} from '@phosphor-icons/react'

export type PhosphorIcon = typeof Tag

export const CATEGORY_ICONS: Record<string, PhosphorIcon> = {
  '월급':    Wallet,
  '급여':    Wallet,
  '부수입':  CurrencyDollar,
  '용돈':    Gift,
  '상여':    Trophy,
  '금융소득': TrendUp,
  '식비':    ForkKnife,
  '교통/차량': Car,
  '교통':    Car,
  '문화생활': FilmStrip,
  '문화/여가': FilmStrip,
  '마트/편의점': ShoppingCart,
  '쇼핑':   ShoppingCart,
  '패션/미용': Scissors,
  '생활용품': Package,
  '주거/통신': House,
  '주거':    House,
  '건강':    Heart,
  '의료/건강': Heart,
  '교육':    BookOpen,
  '경조사/회비': Star,
  '부모님':  Users,
  '이체':    ArrowsLeftRight,
  '보험':    Shield,
  '적금/투자': ChartLineUp,
  '기타':    DotsThree,
  '기타수입': DotsThree,
  '기타지출': DotsThree,
}

export function getCategoryIcon(name: string): PhosphorIcon {
  return CATEGORY_ICONS[name] ?? Tag
}

export { Bank as AssetIcon }
