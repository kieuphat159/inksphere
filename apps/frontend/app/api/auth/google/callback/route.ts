import { BACKEND_URL } from "@/lib/constants";
import { createSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json(
            { message: "Google authentication failed: Authorization code missing" },
            { status: 400 }
        );
    }

    // Quy đổi mã xác thực một lần lấy accessToken và thông tin User
    const tokenRes = await fetch(`${BACKEND_URL}/auth/google/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });

    if (!tokenRes.ok) {
        return NextResponse.json(
            { message: "Google authentication failed: Code exchange failed" },
            { status: 401 }
        );
    }

    const userData = await tokenRes.json();
    const { id: userId, name, avatar, accessToken } = userData;

    if (!accessToken || !userId || !name || !avatar) {
        return NextResponse.json(
            { message: "Google authentication failed: Invalid user payload" },
            { status: 400 }
        );
    }

    // Xác thực token với Backend (Sửa lỗi đúng endpoint /auth/verify-token)
    const verifyRes = await fetch(`${BACKEND_URL}/auth/verify-token`, {
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });

    if (!verifyRes.ok) {
        return NextResponse.json(
            { message: "Google authentication failed: JWT verification failed" },
            { status: 401 }
        );
    }

    await createSession({
        user: {
            id: String(userId),
            name,
            avatar,
        },
        accessToken,
    });

    return NextResponse.redirect(new URL("/", req.url));
}