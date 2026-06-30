"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getDashboardStats() {
    const session = await auth()
    if (!session) return null

    const restaurantId = session.user.restaurantId

    // get start of today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // run all queries at the same time for performance
    const [
        totalOrdersToday,
        revenueToday,
        pendingOrders,
        recentOrders,
    ] = await Promise.all([

        // total orders today
        prisma.order.count({
            where: {
                restaurantId,
                createdAt: { gte: todayStart },
                status: { not: "CANCELLED" },
            },
        }),

        // revenue today
        prisma.order.aggregate({
            where: {
                restaurantId,
                createdAt: { gte: todayStart },
                status: "COMPLETED",
            },
            _sum: {
                total: true
            },
        }),

        // pending orders needing action
        prisma.order.count({
            where: {
                restaurantId,
                status: "NEW",
            },
        }),

        // recent 8 orders
        prisma.order.findMany({
            where: { restaurantId },
            orderBy: { createdAt: "desc" },
            take: 8,
            include: {
                items: true,
            },
        }),

    ])

    return {
        totalOrdersToday,
        revenueToday: revenueToday._sum.total ?? 0,
        pendingOrders,
        recentOrders,
    }
}