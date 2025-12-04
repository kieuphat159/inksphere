import Link from "next/link";

type Props = {}

const Navbar = (props: Props) => {
    return (
        <>
            <h1 className="text-2xl font-bold p-2">My Mordern Blog</h1>
            <div className="flex gap-2 ml-auto [&>a]:py-2 [&>a]:px-4 [&>a]:transition [&>a]:rounded-md [&>a:hover]:text-sky-100 [&>a:hover]:bg-sky-500">
                <Link href="/">
                    Blog
                </Link>

                <Link href="#about">
                    About
                </Link>

                <Link href="#contact">
                    Contact
                </Link>
            </div>
        </>
    );
}

export default Navbar;