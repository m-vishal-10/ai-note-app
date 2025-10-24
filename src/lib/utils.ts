import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
  console.error('Handling error:', error);
  
  if (error instanceof Error) {
    // Handle specific Supabase auth errors
    if (error.message.includes('User already registered')) {
      return { errorMessage: 'An account with this email already exists. Please try logging in instead.' };
    }
    
    if (error.message.includes('Invalid email')) {
      return { errorMessage: 'Please enter a valid email address.' };
    }
    
    if (error.message.includes('Password')) {
      return { errorMessage: 'Password must be at least 6 characters long.' };
    }
    
    if (error.message.includes('duplicate key value') || error.message.includes('users_pkey')) {
      return { errorMessage: 'An account with this email already exists.' };
    }
    
    return { errorMessage: error.message };
  } else if (typeof error === 'object' && error !== null) {
    // Handle Supabase error objects
    const supabaseError = error as any;
    if (supabaseError.message) {
      return { errorMessage: supabaseError.message };
    }
    if (supabaseError.error_description) {
      return { errorMessage: supabaseError.error_description };
    }
  }
  
  return { errorMessage: "Something went wrong. Please try again." };
}
