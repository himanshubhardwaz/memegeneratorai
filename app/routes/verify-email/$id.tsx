import type { LoaderArgs, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
//import { useLoaderData } from "@remix-run/react";
import { verifyUserEmail } from "~/utils/user-services.server";

type LoaderReturnType = TypedResponse<{ message: string } | { error: string }>;

export async function loader({
  params,
}: LoaderArgs): Promise<LoaderReturnType> {
  const userId = params.id;
  if (userId) {
    const verifiedUser = await verifyUserEmail(userId);
    if (verifiedUser) {
      return json({ message: "Email successfully verified!" });
    }
  }
  return json({ error: "Invalid verification link :(" });
}
