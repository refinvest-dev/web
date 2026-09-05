export const accountKeys = {
  all: ['account'] as const,
  usage: () => [...accountKeys.all, 'usage'] as const,
}
