import { useEffect, useRef, useState } from "react";
import { getPurifiedImageCaption } from "~/utils";

function splitEveryN(str: string, n: number): Array<string> {
  const arr = [];
  for (let index = 0; index < str.length; index += n) {
    arr.push(getPurifiedImageCaption(str.slice(index, index + n)));
  }
  return arr;
}

export default function CaptionedImage({
  url,
  caption,
  id,
  isPublic,
}: {
  url: string;
  caption: string;
  id: string;
  isPublic: boolean;
}) {
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function downloadMeme() {
    if (canvasRef.current) {
      const memeImage = canvasRef.current
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");

      console.log({ memeImage });

      const a = document.createElement("a");
      a.setAttribute("href", memeImage);
      a.click();
      a.remove();
    }
  }

  async function copyMemeURL() {
    await navigator.clipboard.writeText(
      `${window.process.env.BASE_URL}/meme/${id}`
    );
    setShareLinkCopied(true);
  }

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const img = new Image();

        const onLoadCallback = () => {
          ctx.drawImage(img, 0, 0, 350, 350);
          ctx.font = "bold 25px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "left";

          const measuredTextWidth = ctx.measureText(caption).width;
          const maxTextLength =
            caption.length / Math.ceil(measuredTextWidth / 340);
          const textSplits = splitEveryN(caption, maxTextLength);
          const measuredSplitTextWidth = ctx.measureText(textSplits[0]).width;
          const xMargin = (340 - measuredSplitTextWidth) / 2;
          const yStartingHeight = 325 - textSplits.length * 14;

          textSplits.forEach((textSplit, index) => {
            ctx.fillText(textSplit, xMargin, yStartingHeight + index * 30, 290);
          });
        };

        img.addEventListener("load", onLoadCallback);
        img.crossOrigin = "Anonymous";
        img.src = url;

        return () => img.removeEventListener("load", onLoadCallback);
      }
    }
  }, [caption, url]);

  if (!url || !caption) {
    return null;
  }

  return (
    <>
      <canvas ref={canvasRef} width={350} height={350} className='border-2' />
      {shareLinkCopied && (
        <div className='alert alert-info shadow-lg mt-2 max-w-[350px]'>
          <div>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='stroke-current flex-shrink-0 w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
            <span>
              Meme link copied to clipboard.{" "}
              {!isPublic && (
                <span>
                  Make sure you set meme to public before sharing the link.
                </span>
              )}
            </span>
          </div>
        </div>
      )}
      <div className='flex gap-8 items-center justify-center mt-2'>
        <div className='tooltip cursor-pointer' data-tip='Download Meme'>
          <svg
            onClick={downloadMeme}
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z'
            />
          </svg>
        </div>
        <div className='tooltip' data-tip='Share Meme'>
          <svg
            onClick={copyMemeURL}
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z'
            />
          </svg>
        </div>
      </div>
    </>
  );
}
