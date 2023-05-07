import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession, destroySession, requireUserSession } from "~/sessions";
import { Form, Link } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Mememind logout" }];
};

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export default function LogoutRoute() {
  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <p>Are you sure you want to log out?</p>
      <Form method='post'>
        <button>Logout</button>
      </Form>
      <Link to='/'>Never mind</Link>
    </main>
  );
}
