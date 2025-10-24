import { createClient } from "@/auth/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";

  const supabase = await createClient();
  const { data: newestNote, error } = await supabase
    .from('notes')
    .select('id')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error fetching newest note:", error);
  }

  return NextResponse.json({
    newestNoteId: newestNote?.id || null,
  });
}