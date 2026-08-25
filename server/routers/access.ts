import { TRPCError } from "@trpc/server";
import { getRegistrationByUserId } from "../db";

export async function requireApprovedParticipation(userId: number, role: "expert" | "lancador") {
  const registration = await getRegistrationByUserId(userId);
  if (!registration || registration.status !== "approved" || registration.requestedRole !== role) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Seu perfil não possui permissão para esta operação." });
  }
  return registration;
}
