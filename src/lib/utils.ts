import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function branchKey(owner: string, repo: string, branch: string) {
  return `${owner}/${repo}/${branch}`;
}

export function getAuthorInitial(author: string) {
  return author.charAt(0).toUpperCase();
}

export const EXTERNAL_LINK_ATTRS = { target: '_blank', rel: 'noopener noreferrer' } as const;
