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
  const password = formData.get("password");

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

  // Login succeeded, send them to the home page.
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function SignupPage() {
  const { error } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <main className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
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
      <Form className='flex-shrink-0 w-full max-w-sm bg-base-100' method='POST'>
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
      </Form>
      <div className='w-full max-w-sm'>
        Dont have an account yet?{" "}
        <Link to='/signup' className='underline'>
          {" "}
          Sign Up
        </Link>
      </div>
    </main>
  );
}
