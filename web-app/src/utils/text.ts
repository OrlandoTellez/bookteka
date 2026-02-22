export const normalizeText = (text: string) => {
  return text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
