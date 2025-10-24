"use server"

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";

export const loginAction = async (email: string, password: string) => {
  try{
    const supabase = await createClient();
    const {error} = await supabase.auth.signInWithPassword({
      email,password
    });
    if(error) throw error;
    return {errorMessage: null};
  }catch(error){
    return handleError(error);
  }
};

export const signUpAction = async (email: string, password: string) => {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user?.id) {
        throw new Error("User ID not found");
      }

      // Create user profile in custom users table if it exists
      // This will fail silently if the table doesn't exist or has permission issues
      try {
        await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email || email,
          }, {
            onConflict: 'id'
          });
      } catch (dbError) {
        // Log but don't fail the signup if user table insert fails
        console.warn('Failed to create user profile record:', dbError);
      }

      return { errorMessage: null };
    } catch (error) {
      return handleError(error);
    }
  };

export const logOutAction = async () => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
