import { BACKEND_URL } from "@/lib/constants";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(req: NextResponse) {
    const { searchParams } = new URL(req.url);
    const accessToken = searchParams.get("accessToken");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");
    const avatar = searchParams.get("avatar");

    if (!accessToken || !userId || !name || !avatar) {
        throw new Error("Google authentication failed");
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    });

    if (res.status === 401) {
        throw new Error("Jwt verification failed");
    }

    await createSession({
        user: {
            id: userId,
            name,
            avatar: avatar ?? undefined
        },
        accessToken
    });
    redirect("/");
}