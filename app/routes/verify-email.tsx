import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { verifyUserEmail } from "~/utils/user-services.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("id");
  if (userId) {
    const verifiedUser = await verifyUserEmail(userId);
    if (verifiedUser) {
      return json({ message: "Email successfully verified!", error: null });
    }
  }
  return json({ error: "Invalid verification link :(", message: null });
}

export default function VerifyEmailPage() {
  const { message, error } = useLoaderData<typeof loader>();
  if (message) {
    return (
      <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
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
            <span>{message}</span>
          </div>
        </div>
      </main>
    );
  } else if (error) {
    return (
      <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
        <div className='alert alert-error shadow-lg'>
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
      </main>
    );
  }

  return <>Please wait...</>;
}
