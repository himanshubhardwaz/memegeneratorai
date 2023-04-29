import sgMail from "@sendgrid/mail";

sgMail.setApiKey(String(process.env.SENDGRID_API_KEY));

export default async function sendEmailVerificationMail({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}) {
  const msg = {
    to,
    from: "himanshu76200@gmail.com",
    subject: "MEMEMIND email verification",
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
