import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {
  return (
    <div className='hero min-h-screen'>
      <div className='hero-overlay bg-opacity-60'></div>
      <div className='hero-content text-center text-neutral-content'>
        <div className='max-w-md'>
          <h1 className='mb-5 text-5xl font-bold'>Hello there</h1>
          <p className='mb-5'>
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <Link to='/create-meme' className='btn btn-primary'>
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
