import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type RomanNumerals = Record<string, number>

export function convertToRoman(num: number) {
  const romanNumerals: RomanNumerals = {
    "M": 1000,
    "CM": 900,
    "D": 500,
    "CD": 400,
    "C": 100,
    "XC": 90,
    "L": 50,
    "XL": 40,
    "X": 10,
    "IX": 9,
    "V": 5,
    "IV": 4,
    "I": 1
  };

  let roman = '';

  for (const key in romanNumerals) {
    if (Object.prototype.hasOwnProperty.call(romanNumerals, key)) {
      const value = romanNumerals[key];
      if (value !== undefined && num >= value) {
        while (num >= value) {
          roman += key;
          num -= value;
        }
      }
    }
  }

  return roman;
}

export function getInitials(name: string): string {
  const words: string[] = name.split(' ').filter(Boolean); // Filter out any empty strings
  if (words.length === 0) return ''; // Return empty string if no words
  // @ts-ignore
  if (words.length === 1) return words[0][0].toUpperCase(); // Return the first initial if only one word
  // @ts-ignore
  const firstInitial: string = words[0][0].toUpperCase();
  // @ts-ignore
  const lastInitial: string = words[words.length - 1][0].toUpperCase();
  return firstInitial + lastInitial;
}
