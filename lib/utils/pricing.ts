export function computeFinalPrice(
  basePrice: number,
  discounts: {
    discount: {
      type: string
      value: number
      isActive: boolean
    }
  }[]
) {
  const active = discounts.find((d) => d.discount.isActive)
  if (!active) return basePrice

  const { type, value } = active.discount

  if (type === "PERCENTAGE") {
    return basePrice - (basePrice * value) / 100
  }

  if (type === "FIXED") {
    return Math.max(0, basePrice - value)
  }

  return basePrice
}