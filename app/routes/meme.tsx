import { json } from "@remix-run/node";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { requireUserSession } from "~/sessions";
import { getPopularMemes } from "~/utils/meme-services.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Mememind popular memes" }];
};

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);
  const popularMemes = getPopularMemes();
  return json(popularMemes);
}

export default function PopularMemesPage() {
  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'></main>
  );
}
