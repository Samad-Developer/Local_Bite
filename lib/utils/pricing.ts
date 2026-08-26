/**
 * Single source of truth for discount resolution.
 *
 * The menu API and the orders API must apply *identical* rules: the orders
 * route re-prices every line against the database, and if it computed a
 * different number than the menu the customer was shown, it would "correct"
 * legitimate orders on every submit.
 */

export interface DiscountRule {
  type: string
  value: number
}

export interface DiscountJoinRow {
  discount: DiscountRule
}

/**
 * Prisma `where` fragment selecting discounts that are active right now.
 * Shared so both routes filter on the same window.
 */
export function activeDiscountWhere(now: Date = new Date()) {
  return {
    discount: {
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
  }
}

/** Picks the discount to apply from a menu item's join rows. */
export function resolveActiveDiscount(
  rows: DiscountJoinRow[] | undefined | null
): DiscountRule | null {
  return rows?.[0]?.discount ?? null
}

/** Applies a discount to a base price. Never returns a negative price. */
export function computeFinalPrice(
  basePrice: number,
  discount: DiscountRule | null
): number {
  if (!discount) return basePrice

  if (discount.type === "PERCENTAGE") {
    return Math.max(0, basePrice - (basePrice * discount.value) / 100)
  }

  if (discount.type === "FIXED") {
    return Math.max(0, basePrice - discount.value)
  }

  return basePrice
}
