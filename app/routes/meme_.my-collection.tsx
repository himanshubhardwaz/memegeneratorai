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
    <>
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
              <div
                className='card xs:w-88 md:w-96 bg-base-100 shadow-xl px-2'
                key={meme.id}
              >
                <figure>
                  <img
                    src={meme.url}
                    alt='MEME'
                    className='xs:h-88 xs:w-88 h-96 w-96 object-cover'
                  />
                </figure>
                <div className='card-body'>
                  <>
                    - {new Date(meme.createdAt).toLocaleDateString("en-IN")}{" "}
                    {new Date(meme.createdAt).toLocaleTimeString("en-IN")}
                  </>
                  <p>{meme.caption}</p>
                  <div className='card-actions justify-end'>
                    <div className='flex items-center justify-center gap-3'>
                      <div className='tooltip' data-tip='Edit Meme'>
                        <Link to={`/meme/my-collection/${meme.id}`}>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            className='w-6 h-6'
                          >
                            <path d='M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z' />
                            <path d='M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z' />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </>
  );
}
