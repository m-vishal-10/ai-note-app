"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error.message);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Sign in error:', error.message);
    throw error;
  }
  
  return data;
}

export async function signUp(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Sign up error:', error.message);
    throw error;
  }
  
  return data;
}