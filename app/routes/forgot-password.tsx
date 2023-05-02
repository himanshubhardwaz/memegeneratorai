import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { findUserByEmail } from "~/utils/user-services.server";
import { getSession, commitSession } from "~/sessions";
import { sendForgotPasswordVerificationMail } from "~/utils/send-verification-mail.server";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();

  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return json(new Error("Invalid data provided"));
  }

  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    session.flash("error", "No account is registered with this email address");
    // Redirect back to the login page with errors.
    return redirect("/forgot-password", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  try {
    await sendForgotPasswordVerificationMail({
      to: existingUser.email,
      userId: existingUser.id,
    });

    return json({ message: "Please check your email to reset password" });
  } catch (error) {
    console.log("Error -> ", error);
    session.flash(
      "error",
      "Could not send verification mail, please try again later."
    );
    // Redirect back to the login page with errors.
    return redirect("/forgot-password", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function SignupPage() {
  const { error } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <div className='card bg-base-100 md:w-96 shadow-xl w-full'>
        <div className='card-body'>
          {error && (
            <div className='alert alert-error shadow-lg w-full max-w-sm'>
              <div>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='stroke-current flex-shrink-0 h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          {data?.message && (
            <>
              <div className='alert alert-success shadow-lg'>
                <div>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='stroke-current flex-shrink-0 h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span>{data.message}</span>
                </div>
              </div>
            </>
          )}
          <Form
            className='flex-shrink-0 w-full max-w-sm bg-base-100'
            method='POST'
          >
            <div className='form-control'>
              <label className='label' htmlFor='email'>
                <span className='label-text'>Email</span>
              </label>
              <input
                type='email'
                name='email'
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
                {isLoading ? "Loading..." : "Request verification mail"}
              </button>
            </div>
          </Form>
          <div className='w-full max-w-sm text-sm mt-6 text-center'>
            <Link to='/login' className='underline'>
              {" "}
              Log In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
