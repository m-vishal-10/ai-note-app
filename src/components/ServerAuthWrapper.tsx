import { getUser } from "@/auth/server";
import { ReactNode } from "react";

interface ServerAuthWrapperProps {
  children: (user: any) => ReactNode;
  fallback?: ReactNode;
}

export default async function ServerAuthWrapper({ 
  children, 
  fallback = null 
}: ServerAuthWrapperProps) {
  let user = null;
  
  try {
    user = await getUser();
  } catch (error) {
    // Silently handle auth errors on server side
    console.debug("Auth session not available on server side");
  }

  return <>{children(user)}</>;
}