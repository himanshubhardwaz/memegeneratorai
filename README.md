# [Meme Generator App](https://memegeneratorai.online)

## Demo

[![App demonstration]          // Title!
(https://github.com/himanshubhardwaz/memegeneratorai/assets/62508572/a523ca3d-54e1-4275-a1ba-9818ea994fab)] // Thumbnail
(https://ik.imagekit.io/q1caodkhg/Screen_Recording_2023-05-07_at_4.55.33_PM.mov?updatedAt=1683458888413) "App demonstration")    // Video Link

https://ik.imagekit.io/q1caodkhg/Screen_Recording_2023-05-07_at_4.55.33_PM.mov?updatedAt=1683458888413

## Overview

This app is a meme generator that uses AI-powered image captioning to generate funny captions for your images. It is built using the Remix.run framework, TypeScript, Prisma, Tailwind, [NLPConnect/ViT-GPT2-Image-Captioning model](https://huggingface.co/nlpconnect/vit-gpt2-image-captioning), OpenAI, and Cloudinary.

## Features

- Generates funny captions for your images using AI-powered image captioning
- Integrates with OpenAI to prompt the meme generator with an image description
- Uses Cloudinary's image transformation to add the caption on the image
- Built using Remix.run framework, TypeScript, Prisma, and Tailwind for efficient and scalable development

## Setup

1. Clone the repository:

```
git clone https://github.com/[username]/meme-generator-app.git
```

2. Install dependencies:

```
cd meme-generator-app
npm install
```

3. Create a `.env` file with the following environment variables:

```
CLOUDINARY_URL=[your Cloudinary URL]
OPENAI_API_KEY=[your OpenAI API key]
COULDINARY_SECRET=[your cloudinary secret]
COULDINARY_API_KEY=[your cloudinary API key]
CLOUDINARY_CLOUD_NAME=[your clodinary cloud name]
OPENAI_API_KEY=[your openai key]
SENDGRID_API_KEY=[your sendgrid api key]
DATABASE_URL=[your db url]
SESSION_SECRET=[any random string]
BASE_URL='http://localhost:3000'
IMAGE_RECOGNITION_MODEL_URL=[run the model locally (use flask)]
```

4. Run the Prisma migration:

```
npx prisma migrate dev
```

5. Start the app:

```
npm start
```

## Usage

1. Upload an image to the app
2. The app will use NLPConnect/ViT-GPT2-Image-Captioning model to generate a description of the image
3. The app will prompt OpenAI with the image description and ask for a funny caption
4. OpenAI will generate a funny caption and the app will use Cloudinary's image transformation to add the caption on the image
5. Download or share your funny meme!

## What's Next

Currently, the app relies on Cloudinary for image transformation and storage, which may not be ideal for all use cases. In the future, we plan to remove this dependency and instead add the caption to the image directly in the browser using JavaScript canvas rendering. This approach would allow us to not save any images, providing better privacy and security for our users. Stay tuned for updates!

## Contributing

Contributions are welcome! Please create a pull request with your changes.

## License

This app is licensed under the [MIT license](https://opensource.org/licenses/MIT).
