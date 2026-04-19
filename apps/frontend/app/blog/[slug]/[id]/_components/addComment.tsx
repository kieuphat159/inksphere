import { SessionUser } from "@/lib/session";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect } from "react";
import { saveComment } from "@/lib/actions/commentAction";
import { toast } from "sonner";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { CommentEntity } from "@/lib/types/modelTypes";

type Props = {
    postId: number;
    user: SessionUser;
    className?: string;
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<{
    comments: CommentEntity[];
    count: number;
}, Error>>
}

const AddComment = (props: Props) => {
    const [state, action] = useActionState(saveComment, undefined);
    useEffect(() => {
    if (!state?.message) return;

    if (state.ok) {
        toast.success("Comment added successfully!", {
            description: state.message,
        });
    } else {
        toast.error("Failed to add comment", {
            description: state.message,
        });
    }
    if (state.ok) {
        props.refetch();
    }
}, [state?.message, state?.ok]);
    return (
        <Dialog open={state?.open}> 
            <DialogTrigger asChild>
                <Button className="my-2">
                    Leave your comment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle className="text-lg font-medium mb-4">
                    Add a comment
                </DialogTitle>
                <form action={action} className={cn(props.className)}>
                    <input type="hidden" name="postId" value={props.postId} />
                    <p className="text-sm text-slate-500 mb-4">
                        Commenting as <span className="font-medium">{props.user.name}</span>
                    </p>
                    <Textarea name="content"
                        placeholder="Your comment here..." 
                    />
                    { !!state?.errors?.content && (
                        <p className="text-sm text-red-500 mt-1 animate-pulse">
                            {state.errors.content}
                        </p> 
                    )}
                    <Button type="submit" className="mt-2">
                        Submit
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddComment;