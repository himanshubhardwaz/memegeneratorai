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
  const data = useLoaderData<typeof loader>();

  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <h2>My collection</h2>
      <div className='flex gap-10 items-center justify-center flex-wrap'>
        {data.userMemesWithcaptionedImageUrl.map((meme) => (
          <>
            <div className='card w-96 bg-base-100 shadow-xl' key={meme.id}>
              <figure>
                <img
                  src={meme.url}
                  alt='MEME'
                  className='h-96 w-96 object-cover'
                />
              </figure>
              <div className='card-body'>
                <h3 className='card-title'>
                  {new Date(meme.createdAt).toLocaleDateString("en-IN")}{" "}
                  {new Date(meme.createdAt).toLocaleTimeString("en-IN")}
                </h3>
                <p>{meme.caption}</p>
                <div className='card-actions justify-end'>
                  <Link className='btn btn-primary' to={`/meme/${meme.id}`}>
                    Edit caption
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
