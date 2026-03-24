import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const editPassword = process.env.EDIT_PASSWORD;

    if (!editPassword) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    if (password === editPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("edit_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function GET(request) {
  const cookie = request.cookies.get("edit_auth");
  if (cookie && cookie.value === "true") {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
