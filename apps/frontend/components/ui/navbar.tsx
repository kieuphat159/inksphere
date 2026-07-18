import Link from "next/link";
import { getSession } from "@/lib/session";
import SignInPanel from "./signInPanel";
import Profile from "../profile";
import SearchBar from "./searchBar";
import NotificationBell from "./notificationBell";

type Props = {}

const Navbar = async (props: Props) => {
    const session = await getSession();
    return (
        <>
            <div className="flex items-center gap-4">
                <Link href='/' className='font-serif italic text-2xl font-bold tracking-tight p-2 shrink-0'>
                    InkSphere
                </Link>
                <div className="hidden md:block">
                    <SearchBar />
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1 md:ml-auto [&>a]:py-2 [&>a]:px-4 [&>a]:transition-all [&>a]:duration-200 [&>a]:font-mono [&>a]:uppercase [&>a]:tracking-widest [&>a]:text-xs [&>a]:font-bold [&>a:hover]:underline [&>a:hover]:underline-offset-4">
                <div className="md:hidden w-full px-4 py-2 border-b border-border/45 mb-2">
                    <SearchBar />
                </div>
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                {session?.user ? (
                    <div className="flex items-center gap-3">
                        <NotificationBell user={session.user} />
                        <Profile user={session.user} />
                    </div>
                ) : (
                    <SignInPanel />
                )}
            </div>
        </>
    );
}

export default Navbar;