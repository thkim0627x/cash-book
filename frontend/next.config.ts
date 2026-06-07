import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // phosphor-icons, MUI는 배럴 import → 필요한 것만 번들에 포함
    optimizePackageImports: ['@phosphor-icons/react', '@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
  },
}

export default nextConfig
