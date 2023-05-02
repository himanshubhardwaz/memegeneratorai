import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getMemeById,
  getCaptionedImageUrl,
  updateMeme,
} from "~/utils/meme-services.server";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  Form,
  useNavigation,
} from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  const id = params.id;
  if (!id) return redirect(`/meme`);

  const meme = await getMemeById(id, request);

  if (meme instanceof Error) {
    throw json({ error: meme.message }, { status: 401 });
  }

  const captionedImageUrl = getCaptionedImageUrl(meme.url, meme.caption);

  return json({ meme, captionedImageUrl });
}

export async function action({ request, params }: ActionArgs) {
  const id = params.id;
  const formData = await request.formData();
  const changedCaption = formData.get("caption");

  if (
    !changedCaption ||
    typeof changedCaption !== "string" ||
    typeof id !== "string"
  ) {
    return json({ error: "Invalid data type" });
  }
  try {
    await updateMeme(id, changedCaption, false);
    return redirect(`/meme/${id}`);
  } catch (error) {
    return json({ error: "Could not update meme caption" });
  }
}

export default function MemeByIdPage() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <div className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <img src={data.captionedImageUrl} alt='' height='500' width='500' />
      <Form className='flex-shrink-0 w-full max-w-sm bg-base-100' method='POST'>
        <div className='form-control'>
          <label className='label' htmlFor='caption'>
            <span className='label-text'>Edit caption</span>
          </label>
          <textarea
            className='textarea textarea-bordered'
            defaultValue={data.meme.caption.trim()}
            name='caption'
            data-gramm='false'
            data-gramm_editor='false'
            data-enable-grammarly='false'
          />
        </div>
        <div className='form-control mt-6'>
          <button
            className='btn btn-primary w-full max-w-sm'
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Save caption"}
          </button>
        </div>
      </Form>
    </div>
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
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
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
