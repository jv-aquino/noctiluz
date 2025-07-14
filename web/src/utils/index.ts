export * from "./validations";
export * from './api';

export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const fetcher = (url: string, errorMessage: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(errorMessage)
    return res.json()
  })