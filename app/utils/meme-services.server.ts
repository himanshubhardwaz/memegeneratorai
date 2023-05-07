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

async function getFunnyImageCaption(description: string) {
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

    return caption;
  } catch (err) {
    throw new Error("Something went wrong");
  }
}

export function getCaptionedImageUrl(
  uploadedImageUrl: string,
  caption: string
) {
  const uploadedImageParts = uploadedImageUrl.split("/");

  const imageIdentifier = uploadedImageParts[uploadedImageParts.length - 1];

  let purifiedCaption = caption
    .replace(/[\r\n]+/gm, "")
    .replace(/,/g, "")
    .replace(/"/g, "");

  //if (purifiedCaption.length >= 20) {
  //  purifiedCaption =
  //    purifiedCaption.substring(0, purifiedCaption.length / 2) +
  //    " \n " +
  //    purifiedCaption.substring(
  //      purifiedCaption.length / 2,
  //      purifiedCaption.length
  //    );
  //}

  //console.log({ purifiedCaption });

  let captionedImageUrl = `https://res.cloudinary.com/${
    process.env.CLOUDINARY_CLOUD_NAME
  }/image/upload/w_800/l_text:arial_24_bold:${purifiedCaption.trim()},g_south,y_10,fl_relative,w_0.95/${imageIdentifier}`.trim();

  return captionedImageUrl;
}

export async function createMeme(
  image: string,
  userDescription: string,
  request: RequestArg
) {
  try {
    const response = await getImageAndUrl(image, userDescription);
    if (response instanceof Error) {
      return new Error("Something Went wrong");
    }
    const { uploadedImageUrl, caption, description } = response;

    const session = await requireUserSession(request);
    const userId = session.get("userId");

    const createdMeme = await prismaClient.meme.create({
      data: {
        userId,
        url: uploadedImageUrl,
        caption,
        description,
      },
    });

    return createdMeme;
  } catch (error) {
    return new Error("Something Went wrong");
  }
}

export async function getImageAndUrl(
  image: string,
  userDescription: string
): Promise<
  { uploadedImageUrl: string; caption: string; description: string } | Error
> {
  const response = await cloudinary.uploader.upload(image);

  const uploadedImageUrl = response?.secure_url;

  // image recogition model
  let description = userDescription;

  if (!description) {
    const res = await fetch(
      `https://flask-production-fd24.up.railway.app?image=${uploadedImageUrl}`
    );

    const result = await res.json();
    description = result.description;
  }

  const caption = await getFunnyImageCaption(description);

  return { uploadedImageUrl, caption, description };
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
  description: string,
  isDescriptionUpdated: boolean,
  isPublic: boolean
) {
  if (!isDescriptionUpdated) {
    const updatedMeme = await prismaClient.meme.update({
      where: { id: memeId },
      data: { isPublic },
    });
    return updatedMeme;
  }

  const caption = await getFunnyImageCaption(description);

  const updatedMeme = await prismaClient.meme.update({
    where: { id: memeId },
    data: { isPublic, description, caption },
  });

  return updatedMeme;
}

export async function deleteMeme(id: string) {
  return await prismaClient.meme.delete({ where: { id: id } });
}

export async function getPublicMemes() {
  return await prismaClient.meme.findMany({
    where: { isPublic: true },
    orderBy: [
      {
        updatedAt: "asc",
      },
    ],
  });
}
