import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import Layout from "~/components/Layout";
import stylesheet from "~/tailwind.css";
import { commitSession, getSession } from "~/sessions";
import Alerts from "./components/Alerts";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const name = session.get("name");
  const userId = session.get("userId");
  const isEmailVerified = session.get("isEmailVerified");

  const successAlert = session.get("successAlert");
  const errorAlert = session.get("errorAlert");
  const infoAlert = session.get("infoAlert");

  return json({
    name,
    userId,
    isEmailVerified,
    successAlert,
    errorAlert,
    infoAlert,
  });
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "close-success-alert") {
    session.unset("successAlert");
  } else if (intent === "close-error-alert") {
    session.unset("errorAlert");
  } else if (intent === "close-info-alert") {
    session.unset("infoAlert");
  }

  return json(null, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>() || {};

  const userId = data?.userId;
  const name = data?.name;
  const isEmailVerified = data?.isEmailVerified;

  const successAlert = data?.successAlert;
  const errorAlert = data?.errorAlert;
  const infoAlert = data?.infoAlert;

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/favicons/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicons/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicons/favicon-16x16.png'
        />
        <link rel='manifest' href='/favicons/site.webmanifest' />
        <link
          rel='mask-icon'
          href='/favicons/safari-pinned-tab.svg'
          color='#5bbad5'
        />
        <meta name='msapplication-TileColor' content='#da532c' />
        <meta name='theme-color' content='#ffffff' />
        <Meta />
        <Links />
      </head>
      <body className='no-scrollbar'>
        <Layout userId={userId} name={name} isEmailVerified={isEmailVerified} />
        <Alerts
          successAlert={successAlert}
          infoAlert={infoAlert}
          errorAlert={errorAlert}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
