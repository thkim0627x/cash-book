export type AssetType = 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'ETC'

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  SAVINGS: '예금/적금',
  CREDIT_CARD: '신용카드',
  CASH: '현금',
  ETC: '기타',
}

export interface Asset {
  id: number
  name: string
  initialAmount: number
  assetType: AssetType
  createdAt: string
}

export interface AssetRequest {
  name: string
  initialAmount: number
  assetType: AssetType
}
