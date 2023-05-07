import { json } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPublicMemes } from "~/utils/meme-services.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Mememind popular memes" }];
};

export async function loader() {
  const publicMemes = await getPublicMemes();
  return json({ publicMemes });
}

export default function PopularMemesPage() {
  const data = useLoaderData<typeof loader>() || {};
  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
      <h2 className='text-3xl font-semibold'>Public memes</h2>
      <div className='flex gap-10 items-center justify-center flex-wrap'>
        {data?.publicMemes &&
          data?.publicMemes?.map((meme) => (
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
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
