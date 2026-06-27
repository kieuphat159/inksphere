import Link from "next/link";
import { getSession } from "@/lib/session";
import SignInPanel from "./signInPanel";
import Profile from "../profile";

type Props = {}

const Navbar = async (props: Props) => {
    const session = await getSession();
    return (
        <>
            <Link href='/' className='font-serif italic text-2xl font-bold tracking-tight p-2'>
                InkSphere
            </Link>
            <div className="flex flex-col md:flex-row items-center gap-1 md:ml-auto [&>a]:py-2 [&>a]:px-4 [&>a]:transition-all [&>a]:duration-200 [&>a]:font-mono [&>a]:uppercase [&>a]:tracking-widest [&>a]:text-xs [&>a]:font-bold [&>a:hover]:underline [&>a:hover]:underline-offset-4">
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                {session?.user ? (
                    <Profile user={session.user} />
                ) : (
                    <SignInPanel />
                )}
            </div>
        </>
    );
}

export default Navbar;