import type { Metadata } from "next";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/providers/ThemeProvider";
import NoteProvider from "@/providers/NoteProvider";
import { Toaster } from "@/components/ui/sonner";
import "@/app/styles/globals.css";

export const metadata: Metadata = {
  title: "AI Notes App",
  description: "AI-powered note-taking application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NoteProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex w-full flex-col">
                <Header />
                <div className="flex-1 p-4">{children}</div>
              </main>
            </SidebarProvider>
            <Toaster />
          </NoteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
