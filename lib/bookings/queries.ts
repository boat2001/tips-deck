import "server-only";

import { getDatabase } from "@/lib/db/client";
import { getUtcDayRange } from "@/lib/football/dates";

export async function getPublicBookingsByDate(date: string) {
  const { start, end } = getUtcDayRange(date);
  return getDatabase().booking.findMany({
    where: { bookingDate: { gte: start, lt: end }, category: "FREE", isActive: true },
    select: { id: true, title: true, platform: true, code: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getCurrentVipBookingsByDate(date: string) {
  const { start, end } = getUtcDayRange(date);
  const bookings = await getDatabase().booking.findMany({
    where: { bookingDate: { gte: start, lt: end }, category: { in: ["VIP1", "VIP2", "VIP3"] }, isActive: true },
    select: {
      id: true,
      category: true,
      priceMinor: true,
      predictions: {
        select: { fixture: { select: { homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return new Map(bookings.map((booking) => [booking.category, booking]));
}
