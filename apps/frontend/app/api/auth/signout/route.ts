import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function GET() {
    await deleteSession();
    redirect('/auth/signin');
}
