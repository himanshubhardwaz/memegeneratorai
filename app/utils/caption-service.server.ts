export async function getImageCaption(url: string) {
  try {
    const response = await fetch(
      `${process.env.AZURE_COMPUTER_VISION_ENDPOINT}/computervision/imageanalysis:analyze?features=caption,read&model-version=latest&language=en&api-version=2023-02-01-preview`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env
            .AZURE_COMPUTER_VISION_SUBSCRIPTION_KEY as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    const { error } = await response.json();
    throw new Error(error.message);
  } catch (error) {
    throw error;
  }
}
