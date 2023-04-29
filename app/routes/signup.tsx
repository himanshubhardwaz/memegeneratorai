import type { ActionArgs } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { addRefreshTokenToWhitelist } from "~/utils/auth-services.server";
import { generateTokens } from "~/utils/jwt.server";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
} from "~/utils/user-services.server";

export async function action({ request }: ActionArgs) {
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

  if (existingUser) {
    return json({ error: "User already exists" });
  }

  try {
    const user = await createUserByEmailAndPassword({ email, password });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
    return json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return json({ error: "Opps! Something went wrong!" });
  }
}

export default function SignupPage() {
  const data = useActionData<typeof action>();

  const navigation = useNavigation();

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24 gap-8'>
      <Form
        className='flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100'
        method='post'
        encType='multipart/form-data'
      >
        <div className='form-control'>
          <label className='label' htmlFor='email'>
            <span className='label-text'>Email</span>
          </label>
          <input
            type='email'
            name='email'
            required
            className='file-input w-full max-w-xs file-input-bordered'
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
            className='file-input w-full max-w-xs file-input-bordered'
          />
        </div>
        <div className='form-control mt-6'>
          <button
            className='btn btn-primary w-full max-w-xs'
            type='submit'
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting"
              ? "Loading..."
              : "Create Profile"}
          </button>
        </div>
      </Form>
    </main>
  );
}
