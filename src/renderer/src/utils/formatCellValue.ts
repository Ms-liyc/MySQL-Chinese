export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'bigint') return value.toString()
  return String(value)
}
