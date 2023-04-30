import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { requireUserSession } from "~/sessions";
import { getPopularMemes } from "~/utils/meme-services.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);
  const popularMemes = getPopularMemes();
  return json(popularMemes);
}

export default function PopularMemesPage() {
  return <>Popular memes collection!</>;
}
