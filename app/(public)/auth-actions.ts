"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDatabase } from "@/lib/db/client";
import { recordAudit } from "@/lib/auth/audit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getRequestMetadata } from "@/lib/auth/request";
import { createSession, revokeAllUserSessions } from "@/lib/auth/session";
import { forgotPasswordSchema, loginSchema, profileSchema, registerSchema, resetPasswordSchema } from "@/lib/auth/validation";
import { requireUser } from "@/lib/auth/authorization";

export type AuthActionState = { error?: string; success?: string };

function safeDestination(value: FormDataEntryValue | null, fallback: string) {
  const destination = typeof value === "string" ? value : fallback;
  return destination.startsWith("/") && !destination.startsWith("//") ? destination : fallback;
}

export async function registerAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your registration details." };

  const database = getDatabase();
  const existing = await database.user.findFirst({ where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] }, select: { id: true } });
  if (existing) return { error: "That email or username is already in use." };

  const user = await database.user.create({
    data: {
      username: parsed.data.username,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      displayName: parsed.data.username,
      phone: parsed.data.phone,
    },
  });
  await createSession(user.id);
  await recordAudit({ actorId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id });
  redirect(safeDestination(formData.get("next"), "/dashboard"));
}

export async function loginAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email or username and password." };

  const database = getDatabase();
  const request = await getRequestMetadata();
  const windowStart = new Date(Date.now() - 15 * 60 * 1000);
  const recentFailures = await database.authAttempt.count({
    where: {
      succeeded: false,
      createdAt: { gte: windowStart },
      OR: [{ identifier: parsed.data.identifier }, ...(request.ipAddress ? [{ ipAddress: request.ipAddress }] : [])],
    },
  });
  if (recentFailures >= 8) return { error: "Too many attempts. Try again in 15 minutes." };

  const user = await database.user.findFirst({
    where: { OR: [{ email: parsed.data.identifier }, { username: parsed.data.identifier }] },
  });
  const passwordMatches = await verifyPassword(parsed.data.password, user?.passwordHash);
  const succeeded = Boolean(user?.isActive && passwordMatches);
  await database.authAttempt.create({ data: { identifier: parsed.data.identifier, ipAddress: request.ipAddress, succeeded } });

  if (!user || !succeeded) return { error: "Email/username or password is incorrect." };

  await database.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  await recordAudit({ actorId: user.id, action: "USER_LOGGED_IN", entityType: "Session" });
  redirect(safeDestination(formData.get("next"), "/dashboard"));
}

export async function updateProfileAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your profile details." };
  await getDatabase().user.update({ where: { id: user.id }, data: parsed.data });
  await recordAudit({ actorId: user.id, action: "PROFILE_UPDATED", entityType: "User", entityId: user.id });
  revalidatePath("/account");
  return { success: "Profile updated." };
}

export async function forgotPasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  const generic = { success: "If that account exists, password-reset instructions will be sent." };
  if (!parsed.success) return generic;

  const database = getDatabase();
  const user = await database.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (!user) return generic;

  const token = randomBytes(32).toString("base64url");
  await database.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
  await database.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  await recordAudit({ actorId: user.id, action: "PASSWORD_RESET_REQUESTED", entityType: "User", entityId: user.id });

  // Delivery is deliberately adapter-ready: connect an email provider in Stage 8.
  // The raw token is never stored in the database or returned to the browser.
  return generic;
}

export async function resetPasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your password." };
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const reset = await getDatabase().passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date() || !reset.user.isActive) return { error: "This reset link is invalid or expired." };

  await getDatabase().$transaction([
    getDatabase().user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    getDatabase().passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ]);
  await revokeAllUserSessions(reset.userId);
  await recordAudit({ actorId: reset.userId, action: "PASSWORD_RESET_COMPLETED", entityType: "User", entityId: reset.userId });
  return { success: "Password updated. You can now login." };
}
