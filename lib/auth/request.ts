import { headers } from "next/headers";

export async function getRequestMetadata() {
  const headerStore = await headers();
  return {
    ipAddress: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip"),
    userAgent: headerStore.get("user-agent")?.slice(0, 500) ?? null,
  };
}
