export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  }
}

export function darkenHex(hex: string, ratio = 0.15): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const mix = (value: number): number => Math.max(0, Math.min(255, Math.round(value * (1 - ratio))))
  const toHex = (value: number): string => value.toString(16).padStart(2, '0')

  return `#${toHex(mix(rgb.r))}${toHex(mix(rgb.g))}${toHex(mix(rgb.b))}`
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}
