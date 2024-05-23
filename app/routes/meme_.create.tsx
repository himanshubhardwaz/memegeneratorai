import type {
  ActionArgs,
  LoaderArgs,
  NodeOnDiskFile,
  TypedResponse,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { createMeme } from "~/utils/meme-services.server";
import { requireUserSession } from "~/sessions";
import type { Meme } from "@prisma/client";
import { useState } from "react";
import { sendEmailVerificationMail } from "~/utils/send-verification-mail.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "memegeneratorai create meme" }];
};

type actionData = TypedResponse<{
  error: Error | null;
  meme: Meme | null;
  message: string | null;
}>;

export async function loader({ request }: LoaderArgs) {
  const session = await requireUserSession(request);
  const isEmailVerified = await session.get("isEmailVerified");
  return json({ isEmailVerified });
}

export async function action({ request }: ActionArgs): Promise<actionData> {
  const session = await requireUserSession(request);

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename,
    }),
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const infer = formData.get("infer");

  if (infer === "resend-verification-email") {
    const userEmail = session.get("email");
    const userId = session.get("userId");
    console.log({ userEmail, userId });
    await sendEmailVerificationMail({
      to: userEmail,
      verificationUrl: `${process.env.BASE_URL}/verify-email?id=${userId}`,
    });
    return json({
      message: "Verification email sent",
      meme: null,
      error: null,
    });
  }

  const memeImage = formData.get("memeImage") as NodeOnDiskFile;
  const memeImagePath = memeImage.getFilePath();
  const description = formData.get("description");

  if (typeof description === "string") {
    const response = await createMeme(memeImagePath, description, request);
    console.log("response: ", response);
    if (response instanceof Error) {
      return json({ error: response, meme: null, message: null });
    }
    return redirect(`/meme/my-collection/${response.id}`);
  }
  return json({
    error: new Error("Something went wrong"),
    meme: null,
    message: null,
  });
}

function CreateMemeForm() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";
  const [showImageDescriptionArea, setShowImageDescriptionArea] =
    useState(false);

  const handleChange = () => {
    setShowImageDescriptionArea((prev) => !prev);
  };

  const fetcherData = fetcher.data;
  return (
    <fetcher.Form className="" method="post" encType="multipart/form-data">
      {fetcherData?.error && (
        <div className="alert alert-error shadow-lg max-w-sm mx-auto">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{fetcherData.error.message}</span>
          </div>
        </div>
      )}
      <div className="form-control">
        <label>
          <p className="font-semibold text-3xl text-left w-full max-w-xs mb-10">
            Create Meme
          </p>
        </label>
      </div>

      <div className="form-control">
        <label className="label" htmlFor="memeImage">
          <span className="label-text">Upload image</span>
        </label>
        <input
          type="file"
          name="memeImage"
          required
          accept="image/png, image/jpeg"
          className="file-input w-full max-w-xs"
        />
      </div>

      <div className="form-control mt-6">
        <label className="label cursor-pointer max-w-xs">
          <span className="label-text">Let AI generate image desciption</span>
          <input
            type="checkbox"
            checked={!showImageDescriptionArea}
            onChange={handleChange}
            className="checkbox"
          />
        </label>
      </div>

      <div
        className={`form-control ${showImageDescriptionArea ? "" : "hidden"}`}
      >
        <label className="label" htmlFor="description">
          <span className="label-text">Image description</span>
        </label>
        <textarea
          className="textarea textarea-bordered max-w-xs"
          name="description"
          placeholder="Describe image in less than 100 characters"
          maxLength={100}
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
      </div>

      <div className="form-control mt-6">
        {!data?.isEmailVerified ? (
          <div
            className="tooltip w-full max-w-xs"
            data-tip="Please verify your email before creating a meme"
          >
            <button
              className="btn w-full max-w-xs btn-outline btn-accent"
              type="submit"
              disabled
            >
              Create Meme
            </button>
          </div>
        ) : (
          <button
            name="infer"
            value="create-meme"
            className="btn w-full max-w-xs btn-outline btn-accent"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Create Meme"}
          </button>
        )}
      </div>
    </fetcher.Form>
  );
}

function ResendVerificationEmailForm() {
  const data = useLoaderData<typeof loader>() || {};
  const fetcher = useFetcher();
  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";

  const fetcherData = fetcher.data;

  return (
    <>
      <fetcher.Form
        encType="multipart/form-data"
        className={`flex-shrink-0 bg-base-100 items-center justify-center 
      ${data?.isEmailVerified ? "hidden" : ""}`}
        method="post"
      >
        {fetcherData?.message && (
          <div className="alert alert-success shadow-lg max-w-sm mx-auto">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Sent Verification Email, do check your spam</span>
            </div>
          </div>
        )}
        <button
          type="submit"
          name="infer"
          value="resend-verification-email"
          className="mx-auto  w-full max-w-sm mt-2 underline"
          disabled={isLoading}
        >
          {isLoading ? "Sending Email..." : "Resend verification email"}
        </button>
      </fetcher.Form>
    </>
  );
}

export default function CreateMemePage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8">
      <CreateMemeForm />
      <ResendVerificationEmailForm />
    </main>
  );
}
