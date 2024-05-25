import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { requireUserSession, getSession } from "~/sessions";
import { prismaClient } from "~/utils/prisma-client.server";
import type { RequestArg } from "~/sessions";
import type { Meme } from "@prisma/client";
import { getPurifiedImageCaption } from "~/utils";
import { getImageCaption } from "./caption-service.server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.COULDINARY_API_KEY,
  api_secret: process.env.COULDINARY_SECRET,
  secure: true,
});

const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(openAIConfig);

async function getImageDescription(uploadedImageUrl: string) {
  const response = await getImageCaption(uploadedImageUrl);
  console.log(response);
  return response.captionResult.text;
}

async function getFunnyImageCaption(description: string) {
  try {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `You are a meme generator, you have been given an image whose description is "${description}", You have to respond with a funny caption`,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const caption = response.choices[0].text;

    return caption;
  } catch (err) {
    throw new Error("Error generating caption for your image, try again later");
  }
}

export function getCaptionedImageUrl(
  uploadedImageUrl: string,
  caption: string
) {
  const uploadedImageParts = uploadedImageUrl.split("/");

  const imageIdentifier = uploadedImageParts[uploadedImageParts.length - 1];

  let purifiedCaption = getPurifiedImageCaption(caption);

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
      return new Error("Error handling image, pls try again later");
    }
    const { uploadedImageUrl, caption, description } = response;

    const session = await requireUserSession(request);
    const userId = session.get("userId");

    try {
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
      return new Error("Error saving your meme, pls try again later");
    }
  } catch (error) {
    if (error instanceof Error) return error;
    else return new Error("Error creating your meme, pls try again later");
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
    description = await getImageDescription(uploadedImageUrl);
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
    //include: { likes: true },
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
  userDescription: string,
  isDescriptionUpdated: boolean,
  isPublic: boolean,
  isAIDescriptionEnabled: boolean,
  memeUrl: string
) {
  if (!isDescriptionUpdated && !isAIDescriptionEnabled) {
    const updatedMeme = await prismaClient.meme.update({
      where: { id: memeId },
      data: { isPublic },
    });
    return updatedMeme;
  }

  // descrition of the image provided by user
  let description = userDescription;

  if (isAIDescriptionEnabled) {
    description = await getImageDescription(memeUrl);
  }

  console.log({ description });

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
    //include: { likes: true },
    orderBy: [
      {
        updatedAt: "asc",
      },
    ],
  });
}
