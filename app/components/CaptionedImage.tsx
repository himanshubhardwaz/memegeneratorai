import { useEffect, useRef } from "react";

function splitEveryN(str: string, n: number): Array<string> {
  const arr = [];

  for (let index = 0; index < str.length; index += n) {
    arr.push(str.slice(index, index + n));
  }

  return arr;
}

export default function CaptionedImage({
  url,
  caption,
}: {
  url: string;
  caption: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();

        const onLoadCallback = () => {
          ctx.drawImage(img, 0, 0, 500, 500);
          ctx.font = "20px serif";
          ctx.textAlign = "right";

          const measuredText = ctx.measureText(caption);

          const measuredTextWidth = measuredText.width;

          const textSplitsRequired = Math.ceil(measuredTextWidth / 490);

          const maxTextLength = caption.length / textSplitsRequired;

          const textSplits = splitEveryN(caption, maxTextLength);

          //console.log({ measuredTextWidth, textSplitsRequired });

          textSplits.forEach((textSplit, index) => {
            ctx.fillText(textSplit, 0, 490 - index * 50, 490);
          });
        };

        img.addEventListener("load", onLoadCallback);
        img.src = url;

        return () => img.removeEventListener("load", onLoadCallback);
      }
    }
  }, [caption, url]);

  if (!url || !caption) {
    return null;
  }

  return <canvas ref={canvasRef} width={500} height={500}></canvas>;
}
