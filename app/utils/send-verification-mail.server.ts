import sgMail from "@sendgrid/mail";
import { prismaClient } from "./prisma-client.server";

sgMail.setApiKey(String(process.env.SENDGRID_API_KEY));

export async function sendEmailVerificationMail({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}) {
  const msg = {
    to,
    from: "himanshu76200@gmail.com",
    subject: "memegeneratorai email verification",
    text: "Click the link below to verify your email address",
    html: `<a href=${verificationUrl}>Verify Account</a>`,
  };

  try {
    await sgMail.send(msg);
    return "Successfully sent verification mail";
  } catch (error) {
    return new Error("Could not sent verification mail");
  }
}

export async function sendForgotPasswordVerificationMail({
  to,
  userId,
}: {
  to: string;
  userId: string;
}) {
  await prismaClient.forgotPassword.updateMany({
    where: { userId },
    data: { isUrlActive: false },
  });

  const forgotPassword = await prismaClient.forgotPassword.create({
    data: { userId },
  });

  const verificationUrl = `${process.env.BASE_URL}/forgot-password/${forgotPassword.id}`;

  const msg = {
    to,
    from: "himanshu76200@gmail.com",
    subject: "memegeneratorai email verification",
    text: "Click the link below to verify your email address",
    html: `<a href=${verificationUrl}>Verify Account</a>`,
  };

  try {
    await sgMail.send(msg);
    return "Successfully sent verification mail";
  } catch (error) {
    console.log("Error -> ", error);
    return new Error("Could not sent verification mail");
  }
}
