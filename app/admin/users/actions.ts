"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordAudit } from "@/lib/auth/audit";
import { requireAdmin } from "@/lib/auth/authorization";
import { getDatabase } from "@/lib/db/client";

const roleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "TIPSTER", "USER"]);

export async function updateUserAccess(formData: FormData) {
  const actor = await requireAdmin();
  if (actor.role !== "SUPER_ADMIN") throw new Error("Only a super administrator can change user access.");
  const userId = z.string().min(1).parse(formData.get("userId"));
  const role = roleSchema.parse(formData.get("role"));
  const isActive = formData.get("isActive") === "true";
  if (userId === actor.id && (!isActive || role !== "SUPER_ADMIN")) throw new Error("You cannot remove your own super-admin access.");
  await getDatabase().user.update({ where: { id: userId }, data: { role, isActive } });
  await recordAudit({ actorId: actor.id, action: "USER_ACCESS_UPDATED", entityType: "User", entityId: userId, metadata: { role, isActive } });
  revalidatePath("/admin/users");
}
