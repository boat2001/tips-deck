import "server-only";
import { getDatabase } from "@/lib/db/client";
import { PaystackProvider } from "@/lib/payments/paystack";
import { verifiedPaymentMatches } from "@/lib/payments/validation";

const dayMilliseconds = 24 * 60 * 60 * 1000;

export async function verifyAndFulfilPayment(reference: string) {
  const database = getDatabase();
  const payment = await database.payment.findUnique({ where: { reference }, include: { user: true, plan: true, subscription: true } });
  if (!payment) return { status: "not_found" as const };
  if (payment.status === "SUCCESS" && payment.subscription) return { status: "success" as const, payment, subscription: payment.subscription };

  const verified = await new PaystackProvider().verify(reference);
  const valid = verifiedPaymentMatches({ reference: payment.reference, amountMinor: payment.amountMinor, currency: payment.currency, email: payment.user.email }, verified);
  if (!valid) {
    if (["pending", "processing", "ongoing", "queued"].includes(verified.status)) {
      await database.payment.update({ where: { id: payment.id }, data: { providerReference: verified.providerReference, gatewayResponse: verified.gatewayResponse, verifiedAt: new Date(), providerData: verified.raw } });
      return { status: "pending" as const };
    }
    const status = ["abandoned", "cancelled"].includes(verified.status) ? "CANCELLED" : "FAILED";
    await database.payment.update({ where: { id: payment.id }, data: { status, providerReference: verified.providerReference, gatewayResponse: verified.gatewayResponse, verifiedAt: new Date(), providerData: verified.raw } });
    return { status: status === "CANCELLED" ? "cancelled" as const : "failed" as const };
  }

  const result = await database.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "users" WHERE "id" = ${payment.userId} FOR UPDATE`;
    const current = await transaction.payment.findUniqueOrThrow({ where: { id: payment.id }, include: { subscription: true } });
    if (current.status === "SUCCESS" && current.subscription) return current.subscription;
    const now = new Date();
    const latest = await transaction.subscription.findFirst({ where: { userId: payment.userId, status: "ACTIVE", expiresAt: { gt: now }, ...(payment.plan.scope === "ALL_PREMIUM" ? { grantsAllPremium: true } : { deckId: payment.plan.deckId }) }, orderBy: { expiresAt: "desc" } });
    const startsAt = latest?.expiresAt && latest.expiresAt > now ? latest.expiresAt : now;
    const expiresAt = new Date(startsAt.getTime() + payment.plan.durationDays * dayMilliseconds);
    await transaction.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS", providerReference: verified.providerReference, gatewayResponse: verified.gatewayResponse, paidAt: verified.paidAt ?? now, verifiedAt: now, providerData: verified.raw } });
    const subscription = await transaction.subscription.upsert({ where: { paymentId: payment.id }, update: {}, create: { userId: payment.userId, planId: payment.planId, paymentId: payment.id, startsAt, expiresAt, grantsAllPremium: payment.plan.scope === "ALL_PREMIUM", deckId: payment.plan.scope === "DECK" ? payment.plan.deckId : null } });
    if (payment.plan.scope === "ALL_PREMIUM") await transaction.user.update({ where: { id: payment.userId }, data: { premiumAccessUntil: expiresAt } });
    return subscription;
  });
  return { status: "success" as const, payment, subscription: result };
}

export async function markPaymentRefunded(reference: string) {
  const database = getDatabase();
  const payment = await database.payment.findUnique({ where: { reference }, include: { subscription: true } });
  if (!payment) return false;
  await database.$transaction(async (transaction) => {
    await transaction.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED", verifiedAt: new Date() } });
    if (payment.subscription) await transaction.subscription.update({ where: { id: payment.subscription.id }, data: { status: "CANCELLED", expiresAt: new Date() } });
    const next = await transaction.subscription.findFirst({ where: { userId: payment.userId, status: "ACTIVE", grantsAllPremium: true, expiresAt: { gt: new Date() }, paymentId: { not: payment.id } }, orderBy: { expiresAt: "desc" } });
    await transaction.user.update({ where: { id: payment.userId }, data: { premiumAccessUntil: next?.expiresAt ?? null } });
  });
  return true;
}
