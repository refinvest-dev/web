export const assetKeys = {
  all: ['assets'] as const,
  list: () => [...assetKeys.all, 'list'] as const,
  availability: (symbol: string) => [...assetKeys.all, 'availability', symbol] as const,
}
