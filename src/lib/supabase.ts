import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          text: string;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
  // Note: auth.users table is automatically managed by Supabase
  // and can be accessed via supabase.auth methods
}
