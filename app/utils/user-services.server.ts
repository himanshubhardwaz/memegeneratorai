import { prismaClient } from "./prisma-client.server";
import bcrypt from "bcrypt";

export async function findUserByEmail(email: string) {
  return await prismaClient.user.findUnique({ where: { email } });
}

export async function createUserByEmailAndPassword(user: {
  email: string;
  password: string;
  name: string;
}) {
  user.password = bcrypt.hashSync(user.password, 12);
  return await prismaClient.user.create({ data: user });
}

//

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

export async function verifyForgotPasswordLink(forgotPasswordId: string) {
  const forgotPasswordData = await prismaClient.forgotPassword.findUnique({
    where: { id: forgotPasswordId },
  });

  return forgotPasswordData;
}

export async function changePassword(userId: string, password: string) {
  return prismaClient.user.update({
    where: { id: userId },
    data: { password: bcrypt.hashSync(password, 12) },
  });
}

export async function getUserAndMemeCount() {
  const userCountPromise = async () => {
    return await prismaClient.user.count();
  };

  const memeCountPromise = async () => {
    return await prismaClient.meme.count();
  };

  const [userCount, memeCount] = await Promise.allSettled([
    userCountPromise(),
    memeCountPromise(),
  ]);

  if (userCount.status === "fulfilled" && memeCount.status === "fulfilled") {
    return { userCount: userCount.value, memeCount: memeCount.value };
  }

  if (userCount.status === "fulfilled") {
    return { userCount: userCount.value, memeCount: null };
  }

  if (memeCount.status === "fulfilled") {
    return { userCount: null, memeCount: memeCount.value };
  }

  return { memeCount: null, userCount: null };
}
