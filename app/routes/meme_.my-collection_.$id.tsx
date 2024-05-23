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
} from "@remix-run/react";
import { commitSession, requireUserSession } from "~/sessions";
import CaptionedImage from "~/components/CaptionedImage";
import { useEffect, useRef } from "react";
import { Alerts } from "~/contants/alerts";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Edit meme" }];
};

export async function loader({ request, params }: LoaderArgs) {
  const session = await requireUserSession(request);
  const id = params.id;
  if (!id) return redirect(`/meme`);

  const meme = await getMemeById(id, request);

  if (meme instanceof Error) {
    throw json({ error: meme.message }, { status: 401 });
  }

  const captionedImageUrl = getCaptionedImageUrl(meme.url, meme.caption);

  return json(
    { meme, captionedImageUrl },
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

  if (intent === "delete" && typeof id === "string") {
    await deleteMeme(id);
    session.set(Alerts.SUCCESS, "Successfully deleted meme");
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
    const isAIDescriptionEnabled =
      formData.get("isAIDescriptionEnabled") === "on";
    const url = formData.get("url");

    const isDescriptionUpdated = description !== initialDescription;

    if (
      !description ||
      typeof description !== "string" ||
      typeof isPublic !== "boolean" ||
      typeof id !== "string" ||
      typeof isAIDescriptionEnabled !== "boolean" ||
      typeof url !== "string"
    ) {
      return json({ error: "Invalid data type" });
    }

    try {
      const updatedMeme = await updateMeme(
        id,
        description,
        isDescriptionUpdated,
        isPublic,
        isAIDescriptionEnabled,
        url
      );
      if (updatedMeme) session.set(Alerts.SUCCESS, "Successfully updated meme");
      const captionedImageUrl = getCaptionedImageUrl(
        updatedMeme.url,
        updatedMeme.caption
      );
      return json(
        { meme: updatedMeme, captionedImageUrl },
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    } catch (error) {
      if (error instanceof Error) return json({ error: error.message });
      return json({
        error: "Something went wrong, Cannot update meme caption!",
      });
    }
  }

  return new Error("Unknow intent type");
}

function UpdateMemeForm() {
  const fetcher = useFetcher<typeof loader>();
  const formRef = useRef<HTMLFormElement>(null);

  const data = useLoaderData<typeof loader>() || {};
  const isPublic = data.meme.isPublic;
  const description = data.meme.description;
  const url = data.meme.url;

  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (formRef.current) {
        formRef.current.description.value = fetcher.data.meme.description;
      }
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <fetcher.Form
      className="flex-shrink-0 w-full max-w-sm bg-base-100"
      method="POST"
      ref={formRef}
    >
      <input
        value={description}
        readOnly
        type="hidden"
        name="initialDescription"
      />
      <input value={url} readOnly type="hidden" name="url" />
      <div className="form-control">
        <label className="label" htmlFor="desciption">
          <span className="label-text">Desciption</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          defaultValue={
            fetcher.data ? fetcher.data.meme.description : description
          }
          name="description"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
      </div>

      <div className="flex items-center gap-2 mt-6">
        <label className="label" htmlFor="isPublic">
          <span>Make it public: </span>
        </label>
        <input
          type="checkbox"
          defaultChecked={isPublic}
          className="checkbox"
          name="isPublic"
        />
      </div>

      <div className="flex items-center gap-2 mt-6">
        <label className="label" htmlFor="isAIDescriptionEnabled">
          <span>Let AI generate desscription: </span>
        </label>
        <input
          type="checkbox"
          defaultChecked={false}
          className="checkbox"
          name="isAIDescriptionEnabled"
        />
      </div>

      <div className="form-control mt-6">
        <button
          className="btn btn-primary"
          name="intent"
          value="update"
          type="submit"
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
    <fetcher.Form method="POST">
      <button
        name="intent"
        value="delete"
        disabled={isLoading}
        className="btn btn-error btn-outline"
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
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8">
        <CaptionedImage
          url={data?.meme?.url}
          caption={data?.meme?.caption}
          id={data?.meme?.id}
          isPublic={data?.meme?.isPublic}
        />
        <UpdateMemeForm
        //isPublic={data.meme.isPublic}
        //description={data.meme.description}
        //url={data?.meme?.url}
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
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8">
        {/*<h1>Error</h1>
        <p>{error.message}</p>*/}
        {/*<p>The stack trace is:</p>
        <pre>{error.stack}</pre>*/}
        Loading...
      </div>
    );
  } else {
    return (
      <h1 className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8">
        Unknown Error
      </h1>
    );
  }
}
