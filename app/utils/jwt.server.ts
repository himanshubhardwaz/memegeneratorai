import jwt from "jsonwebtoken";

export function generateAccessToken(user: { id: string }) {
  return jwt.sign({ userId: user.id }, String(process.env.JWT_ACCESS_SECRET), {
    expiresIn: "5m",
  });
}

export function generateRefreshToken(user: { id: string }, jti: string) {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    String(process.env.JWT_REFRESH_SECRET),
    {
      expiresIn: "8h",
    }
  );
}

export function generateTokens(user: { id: string }, jti: string) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}
