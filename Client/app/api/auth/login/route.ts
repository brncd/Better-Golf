
import { NextResponse } from "next/server";
import { authClient } from "@/lib/authService";
import { cookies } from "next/headers";
import type { AuthResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json({ message: "Email/username and password are required" }, { status: 400 });
    }

    const authResponse = await authClient.login<AuthResponse>({ emailOrUsername, password });

    const { token, ...user } = authResponse;

    cookies().set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Login failed" }, { status: error.response?.status || 500 });
  }
}
