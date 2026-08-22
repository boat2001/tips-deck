import "server-only";
import { redirect } from "next/navigation";
import { adminRoles } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireUser(destination = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(destination)}`);
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!adminRoles.includes(user.role as (typeof adminRoles)[number])) redirect("/account?error=forbidden");
  return user;
}

export function hasPremiumAccess(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return false;
  if (adminRoles.includes(user.role as (typeof adminRoles)[number])) return true;
  return Boolean(user.premiumAccessUntil && user.premiumAccessUntil > new Date());
}

export async function getPremiumAccessContext(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return { allPremium: false, deckIds: [] as string[] };
  if (adminRoles.includes(user.role as (typeof adminRoles)[number])) return { allPremium: true, deckIds: [] as string[] };
  const subscriptions = await (await import("@/lib/db/client")).getDatabase().subscription.findMany({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: new Date() } }, select: { grantsAllPremium: true, deckId: true } });
  return { allPremium: Boolean(user.premiumAccessUntil && user.premiumAccessUntil > new Date()) || subscriptions.some((item) => item.grantsAllPremium), deckIds: subscriptions.flatMap((item) => item.deckId ? [item.deckId] : []) };
}
