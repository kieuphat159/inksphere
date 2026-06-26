import { BACKEND_URL } from "@/lib/constants";
import { createSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const accessToken = searchParams.get("accessToken");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");
    const avatar = searchParams.get("avatar");

    if (!accessToken || !userId || !name || !avatar) {
        return NextResponse.json(
            { message: "Google authentication failed" },
            { status: 400 }
        );
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });

    if (res.status === 401) {
        return NextResponse.json(
            { message: "JWT verification failed" },
            { status: 401 }
        );
    }

    await createSession({
        user: {
            id: userId,
            name,
            avatar,
        },
        accessToken,
    });

    return NextResponse.redirect(new URL("/", req.url));
}