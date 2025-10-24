import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  return client;
}

export async function getUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      // Only log if it's not a session missing error (which is normal for logged out users)
      if (error.message !== 'Auth session missing!' && error.message !== 'Invalid JWT') {
        console.error('Auth error:', error.message);
      }
      return null;
    }

    return user;
  } catch (error) {
    // Only log unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('Auth session missing') && !errorMessage.includes('Invalid JWT')) {
      console.error('Failed to get user:', error);
    }
    return null;
  }
}
