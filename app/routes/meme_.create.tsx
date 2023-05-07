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
import { Form, useActionData } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { createMeme } from "~/utils/meme-services.server";
import { requireUserSession } from "~/sessions";
import type { Meme } from "@prisma/client";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Mememind create meme" }];
};

type actionData = TypedResponse<{
  error: Error | null;
  meme: Meme | null;
}>;

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);
  return null;
}

export async function action({ request }: ActionArgs): Promise<actionData> {
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

  const memeImage = formData.get("memeImage") as NodeOnDiskFile;
  const memeImagePath = memeImage.getFilePath();

  const response = await createMeme(memeImagePath, request);

  if (response instanceof Error) {
    return json({ error: response, meme: null });
  }
  return redirect(`/meme/my-collection/${response.id}`);
}

export default function CreateMemePage() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";

  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      {data?.error && (
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
            <span>{data.error.message}</span>
          </div>
        </div>
      )}
      <Form
        className='flex-shrink-0 w-full max-w-sm bg-base-100'
        method='post'
        encType='multipart/form-data'
      >
        <div className='form-control'>
          <label className='label' htmlFor='memeImage'>
            <span className='label-text'>Upload image</span>
          </label>
          <input
            type='file'
            name='memeImage'
            required
            accept='image/png, image/jpeg'
            className='file-input w-full max-w-xs'
          />
        </div>
        <div className='form-control mt-6'>
          <button
            className='btn btn-primary w-full max-w-xs'
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Create Meme"}
          </button>
        </div>
      </Form>
    </main>
  );
}
