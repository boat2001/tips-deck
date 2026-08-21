"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordAudit } from "@/lib/auth/audit";
import { requireAdmin } from "@/lib/auth/authorization";
import { getDatabase } from "@/lib/db/client";

const bookingSchema = z.object({
  title: z.string().trim().min(2).max(80),
  platform: z.string().trim().min(2).max(50),
  code: z.string().trim().min(2).max(80),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sortOrder: z.coerce.number().int().min(0).max(999),
  isActive: z.string().optional().transform((value) => value === "on"),
});

export async function createBooking(formData: FormData) {
  const actor = await requireAdmin();
  const input = bookingSchema.parse(Object.fromEntries(formData));
  const booking = await getDatabase().booking.create({ data: { ...input, bookingDate: new Date(`${input.bookingDate}T00:00:00.000Z`) } });
  await recordAudit({ actorId: actor.id, action: "BOOKING_CREATED", entityType: "Booking", entityId: booking.id, metadata: { platform: booking.platform, bookingDate: input.bookingDate } });
  revalidatePath("/predictions");
  revalidatePath("/admin/bookings");
}

export async function toggleBooking(formData: FormData) {
  const actor = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await getDatabase().booking.update({ where: { id }, data: { isActive } });
  await recordAudit({ actorId: actor.id, action: isActive ? "BOOKING_PUBLISHED" : "BOOKING_HIDDEN", entityType: "Booking", entityId: id });
  revalidatePath("/predictions");
  revalidatePath("/admin/bookings");
}

export async function deleteBooking(formData: FormData) {
  const actor = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await getDatabase().booking.delete({ where: { id } });
  await recordAudit({ actorId: actor.id, action: "BOOKING_DELETED", entityType: "Booking", entityId: id });
  revalidatePath("/predictions");
  revalidatePath("/admin/bookings");
}
