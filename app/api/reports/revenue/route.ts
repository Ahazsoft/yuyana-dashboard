import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING");
  if (forbidden) return forbidden;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(new Date().setDate(new Date().getDate() - 30));
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  // Aggregations
  const [revenue, paymentStats, bookings] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: from, lte: to },
      },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["provider", "status"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    }),
  ]);

  // Daily revenue
  const dailyPayments = await prisma.payment.findMany({
    where: {
        status: "COMPLETED",
        createdAt: { gte: from, lte: to },
    },
    select: { amount: true, createdAt: true },
  });

  const chartData = dailyPayments.reduce((acc: any, p: any) => {
      const date = p.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + p.amount;
      return acc;
  }, {});

  const formattedChart = Object.entries(chartData).map(([date, revenue]) => ({
      date,
      revenue,
  })).sort((a: any, b: any) => (a.date as string).localeCompare(b.date as string));

  return NextResponse.json({
    totalRevenue: revenue._sum.amount || 0,
    paymentStats,
    bookingStats: bookings,
    chartData: formattedChart,
  });
}