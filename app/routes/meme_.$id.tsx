import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getMemeById } from "~/utils/meme-services.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  const id = params.id;
  if (!id) return null;

  const response = await getMemeById(id, request);

  if (response instanceof Error) {
    return json({ error: response.message });
  }

  return json(response);
}

export default function MemeByIdPage() {
  const data = useLoaderData<typeof loader>();
  return <>Meme by id: {JSON.stringify(data)}</>;
}
