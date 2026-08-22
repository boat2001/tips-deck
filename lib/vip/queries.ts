import "server-only";

import { unstable_cache } from "next/cache";
import { publicVipTag } from "@/lib/cache/tags";
import { getDatabase } from "@/lib/db/client";

const getCachedActiveVipPlans = unstable_cache(async function getCachedActiveVipPlans() {
  return getDatabase().plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      priceMinor: true,
      currency: true,
      durationDays: true,
      isSoldOut: true,
      deck: { select: { name: true, slug: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}, ["active-vip-plans-v1"], { revalidate: 60, tags: [publicVipTag] });

export async function getActiveVipPlans() {
  return getCachedActiveVipPlans();
}
