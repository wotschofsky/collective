import { type ClassValue, clsx } from 'clsx';
import md5 from 'js-md5';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAvatarUrl = (email: string) =>
  `https://gravatar.com/avatar/${md5(email)}?d=identicon&s=64`;
