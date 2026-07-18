"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import Image from "next/image";
import SubmitButton from "@/components/submitButton";
import { PostFormState } from "@/lib/types/formState";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="min-h-[350px] w-full border border-border bg-muted/15 rounded-sm animate-pulse flex items-center justify-center font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading Editor...</div>,
});

type Props = {
    state: PostFormState;
    formAction: (payload: FormData) => void;
    postId?: number;
}

const UpsertPostForm = ({ state, formAction, postId }: Props) => {
    const [imageUrl, setImageUrl] = useState("");
    const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
    const [content, setContent] = useState(state?.data?.content || "");

    useEffect(() => {
        if (!state?.message) return;

        if (state?.ok) {
            toast.success(state.message)
        } else {
            toast.error(state.message)
        }
    }, [state])

    useEffect(() => {
        if (state?.data?.content) {
            setContent(state.data.content);
        }
    }, [state?.data?.content]);

    return (
        <form className="flex flex-col gap-6" action={formAction}>
            {postId !== undefined && <input type="hidden" name="postId" value={postId} />}
            
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="title" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
                <Input id="title" name="title" type="text" required placeholder="Enter post title" className="border-border focus-visible:ring-foreground/10" defaultValue={state?.data?.title} />
                {state?.errors?.title && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.title}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="content" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Content</Label>
                <TiptapEditor content={content} onChange={setContent} />
                <input type="hidden" name="content" value={content} />
                {state?.errors?.content && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.content}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="thumbnail" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Thumbnail</Label>
                <Input id="thumbnail" name="thumbnail" accept="image/*" placeholder="Choose an image" type="file"
                className="border-border focus-visible:ring-foreground/10 cursor-pointer file:cursor-pointer"
                onChange={(e) => {
                    if (e.target.files) {
                        setImageUrl(URL.createObjectURL(e.target.files[0]));
                        setThumbnailRemoved(false);
                    }
                }} />
                {state?.data?.thumbnail && !imageUrl && !thumbnailRemoved && (
                    <div className="flex flex-col gap-2 mt-2 p-2 border border-border bg-muted/10 w-fit rounded-sm">
                        <div className="relative border border-border/40 rounded-sm overflow-hidden">
                            <Image src={state.data.thumbnail as string} alt="Post Thumbnail" width={180} height={120} className="rounded-none object-cover grayscale" />
                        </div>
                        <button type="button" onClick={() => setThumbnailRemoved(true)} className="text-red-600 font-mono text-[9px] uppercase tracking-widest hover:underline w-fit">
                            Remove thumbnail
                        </button>
                    </div>
                )}
                { !!imageUrl && (
                    <div className="flex flex-col gap-2 mt-2 p-2 border border-border bg-muted/10 w-fit rounded-sm">
                        <div className="relative border border-border/40 rounded-sm overflow-hidden">
                            <Image src={imageUrl} alt="Post Thumbnail" width={180} height={120} className="rounded-none object-cover grayscale" />
                        </div>
                    </div>
                ) }
                {postId !== undefined && state?.data?.thumbnail && (
                    <input type="hidden" name="existingThumbnail" value={state.data.thumbnail as string} />
                )}
                {thumbnailRemoved && <input type="hidden" name="removeThumbnail" value="on" />}
                {state?.errors?.thumbnail && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.thumbnail}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="tags" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Tags (comma-separated)</Label> 
                <Input id="tags" name="tags" type="text" placeholder="tutorials, tech, lifestyle" className="border-border focus-visible:ring-foreground/10" defaultValue={state?.data?.tags} />
                {state?.errors?.tags && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.tags}</p>
                )}
            </div>

            <div className="flex items-center gap-3 py-2 cursor-pointer font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                <Input id="published" name="published" type="checkbox" className="h-4 w-4 rounded-sm border-border text-foreground accent-foreground cursor-pointer" defaultChecked={!!state?.data?.published} />
                <Label htmlFor="published" className="cursor-pointer">Published</Label>
                {state?.errors?.published && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider ml-2">{state.errors.published}</p>
                )}
            </div>

            <SubmitButton className="mt-4 w-full font-mono text-[11px] uppercase tracking-widest py-5 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-sm cursor-pointer">
                Save Essay
            </SubmitButton>
        </form>
    )
}

export default UpsertPostForm;