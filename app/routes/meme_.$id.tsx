import type { LoaderArgs } from "@remix-run/node";
import { requireUserSession } from "~/sessions";

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);
  return null;
}

export default function MemeByIdPage() {
  return <>Meme by id</>;
}
