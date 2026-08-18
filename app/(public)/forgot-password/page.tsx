import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = { title: "Forgot Password", description: "Request password-reset instructions for your Tips Deck account." };

export default function ForgotPasswordPage() { return <ForgotPasswordForm />; }
