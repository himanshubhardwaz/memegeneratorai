import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserSession } from "~/sessions";
import { getUsersMemeCollection } from "~/utils/meme-services.server";

export async function loader({ request }: LoaderArgs) {
  const session = await requireUserSession(request);
  const userId = session.get("userId");

  const usersMemeCollection = getUsersMemeCollection(userId);
  return json(usersMemeCollection);
}

export default function MyCollectionPage() {
  const data = useLoaderData<typeof loader>();
  return <>My collection! {JSON.stringify(data)}</>;
}
