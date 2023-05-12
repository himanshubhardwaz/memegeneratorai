export function getPurifiedImageCaption(caption: string) {
  let purifiedCaption = caption
    .replace(/[\r\n]+/gm, "")
    .replace(/,/g, "")
    .replace(/"/g, "")
    .trim();

  return purifiedCaption;
}
