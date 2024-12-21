import { useEffect } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { text } from "@cloudinary/url-gen/qualifiers/source";
import { TextFitQualifier } from "@cloudinary/url-gen/qualifiers/textFit";
import { Position } from "@cloudinary/url-gen/qualifiers/position";
import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";

import type { CaptionedImageProps } from "./CaptionedImage";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  },
});

function purifyCaption(str: string) {
  str = str.replace(/['"]+/g, "");
  str = str.replace(/[^\w\s]|#/g, "");
  str = str.trim();
  str = str.replace(/\s+/g, " ");
  return str;
}

function getImageNameFromUrl(url: string) {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  const nameParts = lastPart.split(".");
  const nameWithoutExtension = nameParts[0];
  return nameWithoutExtension;
}

export default function CloudinaryCaptionedImage(props: CaptionedImageProps) {
  let img = cld.image(getImageNameFromUrl(props.url));

  img
    .resize(scale().width(350).height(350))
    .overlay(
      source(
        text(
          purifyCaption(props.caption),
          new TextStyle("arial", 24).fontWeight("bold")
        )
          .textColor(props.textColor)
          .textFit(new TextFitQualifier(320))
      ).position(new Position().gravity(compass("south")).offsetY(20))
    );

  useEffect(() => {
    props.setCaptionedImageUrl(img.toURL());
  }, []);

  return <img src={img.toURL()} alt="Captioned meme" />;
}
