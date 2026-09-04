export const assetKeys = {
  all: ['assets'] as const,
  list: () => [...assetKeys.all, 'list'] as const,
  availability: (symbol: string) => [...assetKeys.all, 'availability', symbol] as const,
  series: (params: { symbols: string[]; metric: string; start: string; end: string }) =>
    [...assetKeys.all, 'series', params] as const,
}
