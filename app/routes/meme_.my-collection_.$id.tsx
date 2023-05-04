import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getMemeById,
  getCaptionedImageUrl,
  updateMeme,
  deleteMeme,
} from "~/utils/meme-services.server";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  useFetcher,
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
  const intent = formData.get("intent");

  if (intent === "delete" && typeof id === "string") {
    await deleteMeme(id);
    return redirect(`/meme/my-collection`);
  }

  if (intent === "update") {
    const changedCaption = formData.get("caption");
    const isPublic = formData.get("isPublic") === "on";

    if (
      !changedCaption ||
      typeof changedCaption !== "string" ||
      typeof isPublic !== "boolean" ||
      typeof id !== "string"
    ) {
      return json({ error: "Invalid data type" });
    }

    try {
      await updateMeme(id, changedCaption, isPublic);
      return redirect(`/meme/my-collection/${id}`);
    } catch (error) {
      return json({ error: "Could not update meme caption" });
    }
  }

  return new Error("Unknow intent type");
}

function UpdateMemeForm({
  isPublic,
  caption,
}: {
  isPublic: boolean;
  caption: string;
}) {
  const fetcher = useFetcher();

  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";

  return (
    <fetcher.Form
      className='flex-shrink-0 w-full max-w-sm bg-base-100'
      method='POST'
    >
      <input
        //value={isPublic ? "on" : "off"}\
        defaultChecked={isPublic}
        readOnly
        type='hidden'
        name='initialIsPublic'
      />
      <div className='form-control'>
        <label className='label' htmlFor='caption'>
          <span className='label-text'>Caption</span>
        </label>
        <textarea
          className='textarea textarea-bordered'
          defaultValue={caption.trim()}
          name='caption'
          data-gramm='false'
          data-gramm_editor='false'
          data-enable-grammarly='false'
        />
      </div>

      <div className='flex items-center gap-2 mt-6'>
        <label className='label' htmlFor='isPublic'>
          <span>Make it public: </span>
        </label>
        <input
          type='checkbox'
          defaultChecked={isPublic}
          className='checkbox'
          name='isPublic'
        />
      </div>
      <div className='form-control mt-6'>
        <button
          className='btn btn-primary'
          name='intent'
          value='update'
          type='submit'
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Save"}
        </button>
      </div>
    </fetcher.Form>
  );
}

function DeleteMemeForm() {
  const fetcher = useFetcher();

  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";
  return (
    <fetcher.Form method='POST'>
      <button
        name='intent'
        value='delete'
        disabled={isLoading}
        className='btn btn-error btn-outline'
      >
        {isLoading ? "Deleting Meme..." : "Delete Meme"}
      </button>
    </fetcher.Form>
  );
}

export default function MemeByIdPage() {
  const data = useLoaderData<typeof loader>() || {};

  return (
    <>
      <div className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
        <img src={data.captionedImageUrl} alt='' height='500' width='500' />
        <UpdateMemeForm
          isPublic={data.meme.isPublic}
          caption={data.meme.caption}
        />
        <DeleteMemeForm />
      </div>
    </>
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
