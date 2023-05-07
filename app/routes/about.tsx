import type { V2_MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [{ title: "memegeneratorai about page" }];
};

export default function AboutPage() {
  return (
    <main className='flex min-h-[calc(100vh-8rem)] flex-col items-center p-8 gap-8 justify-center'>
      <div className='max-w-3xl'>
        <h1 className='text-2xl mb-10 leading-7 text-center underline'>
          About memegeneratorai
        </h1>
        <p className='text-xl leading-7 text-justify mb-10'>
          Welcome to our website, where creativity meets technology! We are
          excited to introduce our state-of-the-art AI-powered meme generator,
          designed to help you create hilarious and unique memes effortlessly.{" "}
        </p>
        <br />
        <p className='text-xl leading-7 text-justify mb-10'>
          With our intuitive interface and powerful algorithms, you can quickly
          generate memes that will leave your friends and followers laughing out
          loud. Simply choose your favorite image, add your witty caption, and
          let our AI do the rest. You'll be amazed at the quality and creativity
          of the memes you can create with just a few clicks.
        </p>
        <br />
        <p className='text-xl leading-7 text-justify mb-10'>
          Whether you're a seasoned meme-maker or a newcomer to the world of
          internet humor, our website has everything you need to create and
          share memes that will get you noticed. if you're ready to unleash your
          inner comedian and start creating memes like a pro, come join us at
          our website! With our powerful AI tools, user-friendly interface, and
          supportive community, you'll have everything you need to take your
          meme game to the next level.
        </p>
        <br />
        <p className='text-xl leading-7 text-justify mb-10'>
          So why wait?{" "}
          <Link to='/signup' className='link'>
            Signup
          </Link>{" "}
          today and start creating memes that will have the internet buzzing!.
          So what are you waiting for? Start exploring our website today and
          unleash your creativity with our AI-powered meme generator!
        </p>
      </div>
    </main>
  );
}
