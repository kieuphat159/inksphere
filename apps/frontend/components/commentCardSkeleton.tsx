import { Skeleton } from "@/components/ui/skeleton";

const CommentCardSkeleton = () => {
  return (
    <div className="flex flex-col p-2 shadow rounded gap-3">
        <div className="flex items-center gap-2">
            <Skeleton   className="w-12 h-12 rounded-full" />
            <Skeleton className="w-48 h-4" /> 
        </div>
        <Skeleton className="w-96 h-8" />
    </div> 
  );
}

export default CommentCardSkeleton;