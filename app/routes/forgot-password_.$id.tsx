import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";
import {
  verifyForgotPasswordLink,
  changePassword,
} from "~/utils/user-services.server";

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  const forgotPasswordId = params.id;

  if (typeof forgotPasswordId === "string") {
    const forgotPasswordData = await verifyForgotPasswordLink(forgotPasswordId);
    const isUrlActive = forgotPasswordData?.isUrlActive;
    const userId = forgotPasswordData?.userId;
    if (isUrlActive && userId) {
      return json({ userId });
    }
  }
  throw json(
    { error: "" },
    { status: 401, statusText: "Invalid verification Link" }
  );
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const password = formData.get("password");

  console.log({ userId, password });

  const session = await getSession();

  if (
    !userId ||
    !password ||
    typeof userId !== "string" ||
    typeof password !== "string"
  ) {
    return json(new Error("Invalid data provided"));
  }

  await changePassword(userId, password);

  session.set("successAlert", "Successfully updated password");

  // Login succeeded, send them to the home page.
  return redirect("/login", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function VerifyEmailPage() {
  const { userId } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <div className='card bg-base-100 md:w-96 shadow-xl w-full'>
        <div className='card-body'>
          <Form
            className='flex-shrink-0 w-full max-w-sm bg-base-100'
            method='POST'
          >
            <input value={userId} name='userId' type='hidden' />
            <div className='form-control'>
              <label className='label' htmlFor='password'>
                <span className='label-text'>Password</span>
              </label>
              <input
                type='password'
                name='password'
                required
                className='file-input w-full max-w-sm file-input-bordered'
              />
            </div>
            <div className='form-control mt-6'>
              <button
                className='btn btn-primary w-full max-w-sm'
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Change Password"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
        <h1>
          {error.status} {error.statusText}
        </h1>
        {/*<p>{error.data}</p>*/}
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
        <h1>Error</h1>
        <p>{error.message}</p>
        {/*<p>The stack trace is:</p>
        <pre>{error.stack}</pre>*/}
      </div>
    );
  } else {
    return (
      <h1 className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
        Unknown Error
      </h1>
    );
  }
}
