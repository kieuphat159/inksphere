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
                <Button variant="outline" className="w-fit my-2 font-mono text-[11px] uppercase tracking-widest py-5 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-200">
                    Leave your comment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogTitle className="font-serif text-xl font-bold tracking-tight mb-2 text-foreground">
                    Add a comment
                </DialogTitle>
                <form action={action} className={cn(props.className, "flex flex-col gap-4")}>
                    <input type="hidden" name="postId" value={props.postId} />
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
                        Commenting as <span className="font-bold text-foreground">{props.user.name}</span>
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Textarea 
                            name="content"
                            placeholder="Share your thoughts..." 
                            className="border-border focus-visible:ring-foreground/10"
                            rows={4}
                        />
                        { !!state?.errors?.content && (
                            <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">
                                {state.errors.content}
                            </p> 
                        )}
                    </div>
                    <Button type="submit" className="font-mono text-[11px] uppercase tracking-widest py-4 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200">
                        Submit Comment
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddComment;