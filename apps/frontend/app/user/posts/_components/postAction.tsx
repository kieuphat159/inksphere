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
                    <Link href={`/user/posts/${postId}/edit`}
                        className="border p-2 border-yellow-500 rounded-md text-yellow-500 hover:border-yellow-700 
                        hover:text-yellow-700 transition">
                        <PencilIcon className="w-4 h-4" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium">Edit This Post</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={`/user/posts/${postId}/delete`}
                        className="border p-2 border-red-500 rounded-md text-red-500 hover:border-red-700 
                        hover:text-red-700 transition">
                        <TrashIcon className="w-4 h-4" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium">Delete This Post</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
}

export default PostAction;