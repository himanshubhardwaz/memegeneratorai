import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import {
  findUserByEmail,
  checkPasswordValidity,
} from "~/utils/user-services.server";
import { getSession, commitSession } from "~/sessions";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  const data = {
    error: session.get("error"),
    successAlert: session.get("successAlert"),
    infoAlert: session.get("infoAlert"),
    errorAlert: session.get("errorAlert"),
  };

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
  const password = formData.get("password");
  const intent = formData.get("intent");

  if (intent === "close-success-alert") {
    session.unset("successAlert");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json(new Error("Invalid data provided"));
  }

  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    session.flash("error", "Invalid username/password");
    // Redirect back to the login page with errors.
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const validPassword = await checkPasswordValidity(
    password,
    existingUser.password
  );

  if (!validPassword) {
    session.flash("error", "Invalid login credentials");
    // Redirect back to the login page with errors.
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", existingUser.id);
  session.set("name", existingUser.name);

  if (session.has("successAlert")) {
    setTimeout(() => {
      session.unset("successAlert");
    }, 3000);
  }

  // Login succeeded, send them to the home page.
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function LoginPage() {
  const { error, successAlert } = useLoaderData<typeof loader>() || {};
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";

  return (
    <>
      <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
        <div className='card bg-base-100 md:w-96 shadow-xl w-full'>
          <div className='card-body'>
            <p className='font-semibold text-lg text-center mb-6'>
              Log into your account
            </p>
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
                <label className='label'>
                  <Link to='/forgot-password' className='label-text-alt link'>
                    Forgot password?
                  </Link>
                </label>
              </div>
              <div className='form-control mt-6'>
                <button
                  className='btn btn-primary w-full max-w-sm'
                  type='submit'
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Log In"}
                </button>
              </div>
              <div className='w-full max-w-sm text-sm mt-6'>
                Dont have an account yet?{" "}
                <Link to='/signup' className='underline'>
                  {" "}
                  Sign Up
                </Link>
              </div>
            </Form>
          </div>
        </div>
        {successAlert && (
          <div className='toast toast-top '>
            <div className='alert alert-success'>
              <div>
                <span>{successAlert}</span>
                <Form method='post'>
                  <button
                    className='mt-1'
                    name='intent'
                    value='close-success-alert'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke-width='1.5'
                      stroke='currentColor'
                      className='w-6 h-6'
                    >
                      <path
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </Form>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
