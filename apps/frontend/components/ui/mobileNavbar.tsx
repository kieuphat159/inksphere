import { PropsWithChildren } from "react"
import Sidebar from "./sidebar"
import Bars3Icon from "@heroicons/react/24/solid/esm/Bars3Icon"
import Link from "next/link"

type Props = PropsWithChildren

export default function MobileNavbar(props: Props) {
    return (
        <div className="md:hidden fixed top-0 left-0 w-full bg-background/90 backdrop-blur-sm border-b border-border z-40 px-4 py-3 flex items-center justify-between text-foreground">
            <Link href='/' className='font-serif italic font-bold text-lg'>Inkwell</Link>
            <Sidebar
                triggerIcon={<Bars3Icon className="w-5 h-5" />}
                triggerClassName="p-1 border border-border hover:bg-foreground hover:text-background transition-colors"
            >
                {props.children}
            </Sidebar>
        </div>
    )
}
