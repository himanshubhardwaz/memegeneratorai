import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getMemeById,
  getCaptionedImageUrl,
} from "~/utils/meme-services.server";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
} from "@remix-run/react";
import CaptionedImage from "~/components/CaptionedImage";

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

export default function MemeByIdPage() {
  const data = useLoaderData<typeof loader>() || {};
  return (
    <div className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <CaptionedImage
        url={data?.meme?.url}
        caption={data?.meme?.caption}
        id={data?.meme?.id}
        isPublic={data?.meme?.isPublic}
      />
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
        Loading...
        {/*<h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>*/}
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
