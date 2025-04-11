// lib/auth/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // Wait for the cookie store to resolve since cookies() is async
  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Get all cookies (async)
        getAll: async () => {
          return await cookieStore.getAll()
        },
        // Set cookies (async)
        setAll: async (cookiesToSet) => {
          cookiesToSet.forEach(async ({ name, value, options }) => {
            await cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

export async function getUser() {
  const client = await createClient()
  const { data, error } = await client.auth.getUser()
  if (error) {
    console.error('Supabase auth error:', error)
    return null
  }
  return data.user
}
