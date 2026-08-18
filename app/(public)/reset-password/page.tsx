import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = { title: "Reset Password", description: "Choose a new password for your Tips Deck account." };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <ResetPasswordForm token={token} />;
}
