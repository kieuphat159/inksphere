import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SessionUser = {
    id?: string;
    name?: string;
    avatar?: string;
}

export type Session = {
    user: SessionUser;
    accessToken: string;
}

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodeKey = new TextEncoder().encode(secretKey);
const isProduction = process.env.NODE_ENV === "production";

export async function createSession(payload: Session) {
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime("7d").sign(encodeKey);

    const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    (await cookies()).set("session", session, {
        httpOnly: true,
        secure: isProduction,
        expires: expiredAt,
        sameSite: "lax",
        path: "/",
    })
}

export async function getSession() {
    const cookie = (await cookies()).get("session")?.value;

    if (!cookie) return null;
    try {
        const { payload } = await jwtVerify(cookie, encodeKey, {
            algorithms: ['HS256']
        });
        return payload as Session;
    } catch (error) {
        console.error("Failed to verify session token:", error);
        redirect('/auth/signin');
    }
}

export async function deleteSession() {
    await (await cookies()).delete("session");
}