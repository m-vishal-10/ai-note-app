import { createClient } from "@/auth/server";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { Note as UINote } from "@/types/ui";
import Link from "next/link";
import SidebarGroupContent from "./SidebarGroupContent";
import ServerAuthWrapper from "./ServerAuthWrapper";

async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <ServerAuthWrapper>
            {async (user) => {
              let notes: UINote[] = [];

              if (user) {
                try {
                  const supabase = await createClient();
                  const { data, error } = await supabase
                    .from("notes")
                    .select("id, text, updated_at")
                    .eq("author_id", user.id)
                    .order("updated_at", { ascending: false });

    if (!error && data) {
      notes = data.map((n) => ({ id: n.id, text: n.text, updatedAt: n.updated_at }));
    }
                } catch (error) {
                  console.error("Failed to fetch notes:", error);
                }
              }

              return (
                <>
                  <SidebarGroupLabel className="mb-2 mt-2 text-lg">
                    {user ? (
                      "Your Notes"
                    ) : (
                      <p>
                        <Link href="/login" className="underline">
                          Login
                        </Link>{" "}
                        to see your notes
                      </p>
                    )}
                  </SidebarGroupLabel>
                  {user && <SidebarGroupContent notes={notes} />}
                </>
              );
            }}
          </ServerAuthWrapper>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;