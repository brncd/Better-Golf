
import { cookies } from "next/headers";
import type { User } from "@/types";

export async function getSession(): Promise<User | null> {
  const token = cookies().get("session_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                 payload.role || [];
    const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
                 payload.email || '';
    const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                    payload.unique_name || payload.name || '';

    return {
      email,
      username,
      roles: Array.isArray(roles) ? roles : [roles]
    };
  } catch (error) {
    console.error("Failed to parse session token:", error);
    return null;
  }
}
