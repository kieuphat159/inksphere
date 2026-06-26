import { Button } from "@/components/ui/button";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const NoPosts = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="font-serif text-3xl italic text-muted-foreground">No essays found.</p>
      <Button asChild variant="outline" className="font-mono text-[11px] uppercase tracking-widest py-5 px-6 border-border hover:bg-foreground hover:text-background rounded-sm">
        <Link href={"/user/create-post"} className="flex items-center gap-2">
          <PencilSquareIcon className="w-4 h-4" />
          <span>Write Your First Essay</span>
        </Link>
      </Button>
    </div>
  )
}

export default NoPosts;