import "server-only";

import { getDatabase } from "@/lib/db/client";
import { getUtcDayRange } from "@/lib/football/dates";

export async function getPublicBookingsByDate(date: string) {
  const { start, end } = getUtcDayRange(date);
  return getDatabase().booking.findMany({
    where: { bookingDate: { gte: start, lt: end }, isActive: true },
    select: { id: true, title: true, platform: true, code: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
