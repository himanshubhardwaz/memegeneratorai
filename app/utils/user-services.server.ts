import { prismaClient } from "./prisma-client.server";
const bcrypt = require("bcrypt");

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
