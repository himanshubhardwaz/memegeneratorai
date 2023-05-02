import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
} from "~/utils/user-services.server";
import { sendEmailVerificationMail } from "~/utils/send-verification-mail.server";
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
  const name = formData.get("name");

  if (
    !email ||
    !password ||
    !name ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string"
  ) {
    return json(new Error("Invalid data provided"));
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    session.flash("error", "User already exists");
    // Redirect back to the login page with errors.
    return redirect("/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const user = await createUserByEmailAndPassword({ email, password, name });

  sendEmailVerificationMail({
    to: user.email,
    verificationUrl: `${process.env.BASE_URL}/verify-email?id=${user.id}`,
  });

  session.set("userId", user.id);
  session.set("name", user.name);

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
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
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
      <Form className='flex-shrink-0 w-full max-w-sm bg-base-100' method='post'>
        <div className='form-control'>
          <div className='form-control'>
            <label className='label' htmlFor='name'>
              <span className='label-text'>Full name</span>
            </label>
            <input
              type='name'
              name='name'
              required
              className='file-input w-full max-w-sm file-input-bordered'
            />
          </div>

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
            {isLoading ? "Loading..." : "Sign Up"}
          </button>
        </div>
      </Form>
      <div className='w-full max-w-sm'>
        Already have an account?{" "}
        <Link to='/login' className='underline'>
          {" "}
          Log In
        </Link>
      </div>
    </main>
  );
}
