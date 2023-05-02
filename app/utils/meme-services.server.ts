import { Configuration, OpenAIApi } from "openai";
import { v2 as cloudinary } from "cloudinary";
import { requireUserSession, getSession } from "~/sessions";
import { prismaClient } from "~/utils/prisma-client.server";
import type { RequestArg } from "~/sessions";
import type { Meme } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.COULDINARY_API_KEY,
  api_secret: process.env.COULDINARY_SECRET,
  secure: true,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export function getCaptionedImageUrl(
  uploadedImageUrl: string,
  caption: string
) {
  const uploadedImageParts = uploadedImageUrl.split("/");

  const imageIdentifier = uploadedImageParts[uploadedImageParts.length - 1];

  const captionedImageUrl = `https://res.cloudinary.com/${
    process.env.CLOUDINARY_CLOUD_NAME
  }/image/upload/w_800/l_text:arial_24:${encodeURIComponent(
    caption
  )},g_south,y_10,fl_relative,w_0.9/${imageIdentifier}`;

  return captionedImageUrl;
}

export async function createMeme(image: string, request: RequestArg) {
  try {
    const response = await getImageAndUrl(image);
    if (response instanceof Error) {
      return new Error("Something Went wrong");
    }
    const { uploadedImageUrl, caption } = response;

    const session = await requireUserSession(request);
    const userId = session.get("userId");

    const createdMeme = await prismaClient.meme.create({
      data: { userId, url: uploadedImageUrl, caption },
    });

    return createdMeme;
  } catch (error) {
    return new Error("Something Went wrong");
  }
}

export async function getImageAndUrl(
  image: string
): Promise<{ uploadedImageUrl: string; caption: string } | Error> {
  const response = await cloudinary.uploader.upload(image);

  const uploadedImageUrl = response?.secure_url;

  // image recogition model
  const res = await fetch(
    `https://flask-production-fd24.up.railway.app?image=${uploadedImageUrl}`
  );

  const result = await res.json();
  const description = result.description;

  // openai to get image caption
  let caption = "";

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `You are a meme generator, you have been given the image whose description is ${description}, You respond with a funny caption`,
      temperature: 0.7,
      max_tokens: 60,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    caption = response.data.choices[0].text ?? "";

    return { uploadedImageUrl, caption };
  } catch (error) {
    console.log("Error --->>> ", error);
  }
  return new Error("Something Went wrong");
}

export async function getMemeById(
  id: string,
  request: RequestArg
): Promise<Meme | Error> {
  const meme = await prismaClient.meme.findUnique({ where: { id } });
  if (!meme) throw new Error("Could not find meme");

  const { isPublic, userId } = meme;

  const session = await getSession(request.headers.get("Cookie"));

  if (!isPublic) {
    if (session.get("userId") === userId) {
      return meme;
    }
    throw new Error("This meme is not public");
  }

  return meme;
}

export async function getUsersMemeCollection(userId: string) {
  const usersMemeCollection = await prismaClient.meme.findMany({
    where: { userId: userId },
  });

  return usersMemeCollection;
}

export async function getPopularMemes() {
  const popularMemes = await prismaClient.meme.findMany({
    take: 10,
    where: { isPublic: true },
    orderBy: [
      {
        updatedAt: "asc",
      },
    ],
  });

  return popularMemes;
}

export async function updateMeme(
  memeId: string,
  newCaption: string,
  isPublic: boolean
) {
  const updatedMeme = await prismaClient.meme.update({
    where: { id: memeId },
    data: { caption: newCaption, isPublic },
  });
  return updatedMeme;
}
