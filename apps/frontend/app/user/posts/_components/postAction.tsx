import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PencilIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";
import Link from "next/link";

type Props = {
    postId: number;
}

const PostAction = async ({ postId }: Props) => {
    return <div className="flex gap-2 justify-center items-center">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={`/user/posts/${postId}/update`}
                        className="border border-border p-2 rounded-sm text-foreground hover:bg-foreground hover:text-background transition-all duration-150">
                        <PencilIcon className="w-3.5 h-3.5" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1">
                    Edit Post
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={`/user/posts/${postId}/delete`}
                        className="border border-border p-2 rounded-sm text-red-600 hover:bg-red-600 hover:text-white transition-all duration-150">
                        <TrashIcon className="w-3.5 h-3.5" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 bg-red-600 text-white">
                    Delete Post
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
}

export default PostAction;