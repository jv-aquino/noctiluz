import { comparePassword } from "./password";
import prisma from "../db";

export async function getUserRole(userId: string) {
    if (!userId) return [];
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    return user?.role;
}

export async function getUserByEmail(email: string, plainPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return null;

  const isValid = await comparePassword(plainPassword, user.password);
  if (!isValid) return null;
  return user;
}