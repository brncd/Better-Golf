import { cookies } from "next/headers";
import { config } from "./config";
import type { User } from "@/types";

export async function getSession(): Promise<User | null> {
  try {
    const sessionToken = cookies().get("session_token")?.value;
    
    if (!sessionToken) {
      return null;
    }

    const response = await fetch(`${config.api.baseUrl}/api/auth/me`, {
      headers: {
        'Cookie': `session_token=${sessionToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}
