import { Button } from "@/components/ui/button";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const NoPosts = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 mt-32">
      <p className="text-5xl text-center p-4 text-slate-400">No posts found.</p>
      <Button asChild>
        <Link href={"/user/create-post"}>
          <span>
            <PencilSquareIcon className="w-4" />
          </span>
        </Link>
      </Button>
    </div>
  )
}

export default NoPosts;