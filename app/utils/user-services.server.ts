import { prismaClient } from "./prisma-client.server";
import bcrypt from "bcrypt";

export async function findUserByEmail(email: string) {
  return await prismaClient.user.findUnique({ where: { email } });
}

export async function createUserByEmailAndPassword(user: {
  email: string;
  password: string;
}) {
  user.password = bcrypt.hashSync(user.password, 12);
  return await prismaClient.user.create({ data: user });
}

export async function findUserById(id: string) {
  return await prismaClient.user.findUnique({
    where: {
      id,
    },
  });
}

export async function checkPasswordValidity(
  passwordEntered: string,
  userPasswords: string
) {
  return await bcrypt.compare(passwordEntered, userPasswords);
}

export async function verifyUserEmail(id: string) {
  return await prismaClient.user.update({
    where: { id },
    data: { isEmailVerified: true },
  });
}
