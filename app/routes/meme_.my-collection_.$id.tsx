import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
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
  Form,
} from "@remix-run/react";
import { commitSession, requireUserSession } from "~/sessions";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Edit meme" }];
};

export async function loader({ request, params }: LoaderArgs) {
  const session = await requireUserSession(request);
  const id = params.id;
  if (!id) return redirect(`/meme`);

  const successAlert = session.get("successAlert");

  const meme = await getMemeById(id, request);

  if (meme instanceof Error) {
    throw json({ error: meme.message }, { status: 401 });
  }

  const captionedImageUrl = getCaptionedImageUrl(meme.url, meme.caption);

  return json(
    { meme, captionedImageUrl, successAlert },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ request, params }: ActionArgs) {
  const session = await requireUserSession(request);
  const id = params.id;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "close-success-alert") {
    session.unset("successAlert");
    return redirect(`/meme/my-collection/${id}`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (intent === "delete" && typeof id === "string") {
    await deleteMeme(id);
    session.set("successAlert", "Successfully deleted meme");
    return redirect(`/meme/my-collection`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (intent === "update") {
    const isPublic = formData.get("isPublic") === "on";
    const description = formData.get("description");
    const initialDescription = formData.get("initialDescription");

    const isDescriptionUpdated = description !== initialDescription;

    if (
      !description ||
      typeof description !== "string" ||
      typeof isPublic !== "boolean" ||
      typeof id !== "string"
    ) {
      return json({ error: "Invalid data type" });
    }

    try {
      const updatedMeme = await updateMeme(
        id,
        description,
        isDescriptionUpdated,
        isPublic
      );
      if (updatedMeme) session.set("successAlert", "Successfully updated meme");
      return redirect(`/meme/my-collection/${id}`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (error) {
      return json({ error: "Could not update meme caption" });
    }
  }

  return new Error("Unknow intent type");
}

function UpdateMemeForm({
  isPublic,
  description,
}: {
  isPublic: boolean;
  description: string;
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
        value={description}
        readOnly
        type='hidden'
        name='initialDescription'
      />
      <div className='form-control'>
        <label className='label' htmlFor='desciption'>
          <span className='label-text'>Desciption</span>
        </label>
        <textarea
          className='textarea textarea-bordered'
          defaultValue={description}
          name='description'
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
          {isLoading ? "Loading..." : "Update meme"}
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
          description={data.meme.description}
        />
        <DeleteMemeForm />
        {data?.successAlert && (
          <div className='toast toast-top '>
            <div className='alert alert-success'>
              <div>
                <span>{data?.successAlert}</span>
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
        {/*<h1>Error</h1>
        <p>{error.message}</p>*/}
        {/*<p>The stack trace is:</p>
        <pre>{error.stack}</pre>*/}
        Loading...
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
