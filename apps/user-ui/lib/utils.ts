import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import axiosInstance from '@/utils/axiosInstance'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { axiosInstance }
