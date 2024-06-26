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
import Alert from "./components/Alert";
import { AlertIntent, Alerts } from "./contants/alerts";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderArgs) {
  const BASE_URL = process.env.BASE_URL;
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
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
    ENV: { BASE_URL, CLOUDINARY_CLOUD_NAME },
  });
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent === AlertIntent.CLOSE_SUCCESS_ALERT) {
    session.unset(Alerts.SUCCESS);
  } else if (intent === AlertIntent.CLOSE_ERROR_ALERT) {
    session.unset(Alerts.ERROR);
  } else if (intent === AlertIntent.CLOSE_INFO_ALERT) {
    session.unset(Alerts.INFO);
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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicons/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body className="no-scrollbar">
        <Layout userId={userId} name={name} isEmailVerified={isEmailVerified} />
        <Alert
          successAlert={successAlert}
          infoAlert={infoAlert}
          errorAlert={errorAlert}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.process = ${JSON.stringify({ env: data.ENV })}`,
          }}
        />
        <Scripts />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
