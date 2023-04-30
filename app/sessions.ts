import { createCookieSessionStorage, redirect } from "@remix-run/node"; // or cloudflare/deno
import type { LoaderArgs } from "@remix-run/node";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // a Cookie from `createCookie` or the same CookieOptions to create one
    cookie: {
      name: "__session",
      secrets: ["r3m1xr0ck5"],
      sameSite: "lax",
    },
  });

type RequestArg = LoaderArgs["request"];

export async function requireUserSession(request: RequestArg) {
  // get the session
  const session = await getSession(request.headers.get("Cookie"));

  // validate the session, `userId` is just an example, use whatever value you
  // put in the session when the user authenticated
  if (!session.has("userId")) {
    // if there is no user session, redirect to login
    throw redirect("/login");
  }

  return session;
}
