import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUserSession } from "~/sessions";
import {
  getCaptionedImageUrl,
  getUsersMemeCollection,
} from "~/utils/meme-services.server";

export async function loader({ request }: LoaderArgs) {
  const session = await requireUserSession(request);
  const userId = session.get("userId");

  const userMemesCollection = await getUsersMemeCollection(userId);
  const userMemesWithcaptionedImageUrl = userMemesCollection.map((meme) => ({
    ...meme,
    captionedImageUrl: getCaptionedImageUrl(meme.url, meme.caption),
  }));
  return json({ userMemesWithcaptionedImageUrl });
}

export default function MyCollectionPage() {
  const data = useLoaderData<typeof loader>() || {};

  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <h2 className='text-3xl font-semibold'>My collection</h2>
      <div className='flex gap-10 items-center justify-center flex-wrap'>
        {data?.userMemesWithcaptionedImageUrl &&
          data?.userMemesWithcaptionedImageUrl?.length === 0 && (
            <>
              <h3 className='text-xl'>You have not created any memes yet.</h3>
              <Link to='/meme/create' className='link'>
                Create now
              </Link>
            </>
          )}
        {data?.userMemesWithcaptionedImageUrl &&
          data?.userMemesWithcaptionedImageUrl?.map((meme) => (
            <>
              <div
                className='card w-96 bg-base-100 shadow-xl mx-4'
                key={meme.id}
              >
                <figure>
                  <img
                    src={meme.url}
                    alt='MEME'
                    className='h-88 w-88 object-cover'
                  />
                </figure>
                <div className='card-body'>
                  <h3 className='card-title'>
                    {new Date(meme.createdAt).toLocaleDateString("en-IN")}{" "}
                    {new Date(meme.createdAt).toLocaleTimeString("en-IN")}
                  </h3>
                  <p>{meme.caption}</p>
                  <div className='card-actions justify-end'>
                    <Link className='btn' to={`/meme/my-collection/${meme.id}`}>
                      Edit Meme
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ))}
      </div>
    </main>
  );
}
