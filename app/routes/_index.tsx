import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUserAndMemeCount } from "~/utils/user-services.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Mememind Homepage" }];
};

export async function loader() {
  const { userCount, memeCount } = await getUserAndMemeCount();

  let uCount = 17;
  let mCount = 107;

  if (userCount) {
    uCount += userCount;
  }

  if (memeCount) {
    mCount += memeCount;
  }

  return json({ userCount: uCount, memeCount: mCount });
}

export default function Index() {
  const data = useLoaderData<typeof loader>() || {};
  return (
    <div className='min-h-[calc(100vh-8rem)] flex flex-col gap-20 items-center justify-center py-10 px-4 md:mt-20'>
      <section className='grid grid-cols-1 lg:grid-cols-2 max-w-4xl justify-items-center gap-4'>
        <div className='m-auto'>
          <p className='text-4xl font-semibold'>
            Generate memes with a click of a button
          </p>
          <p className='text-xl mt-5'>
            Make and share funny memes, Because Life's Too Short to Be Serious.{" "}
            Say Goodbye to Human Creativity: Let AI Do the Work for You 😅.
          </p>
          <div className='flex items-center justify-center lg:justify-start '>
            <Link to='/meme/create' className='btn my-4 btn-primary'>
              Get Started
            </Link>
          </div>
        </div>
        <div className='m-auto'>
          <img
            src='/images/section-intro-img.png'
            className='rounded-lg'
            alt=''
            height='300'
            width='300'
            loading='lazy'
          />
        </div>
      </section>

      <section className='max-w-4xl mt-12'>
        <p className='text-3xl font-semibold'>
          Join the <span className='text-secondary'>{data?.userCount}</span>{" "}
          users creating <span className='text-accent'>{data?.memeCount}</span>{" "}
          memes so far!
        </p>
      </section>

      <section className='max-w-4xl mt-2'>
        <p className='text-3xl font-bold text-center'>
          Let us save your creativity
        </p>
        <p className='text-lg mt-8'>
          "Feeling bored? Tired of scrolling through endless social media feeds?
          Let our AI-powered meme generator put a smile on your face! With just
          a few taps, you can create hilarious memes that will have your friends
          and followers rolling on the floor laughing. And the best part? You
          don't need any artistic talent – just let our algorithm do the work
          for you!"{" "}
        </p>
      </section>

      <section className='max-w-4xl'>
        <p className='text-3xl font-bold text-center'>
          Like seriously, it's THIS easy
        </p>
        <div className='mt-10'>
          <video
            src='https://ik.imagekit.io/q1caodkhg/Screen_Recording_2023-05-07_at_4.55.33_PM.mov?updatedAt=1683458888413'
            autoPlay
            controls
          />
        </div>
      </section>
    </div>
  );
}
