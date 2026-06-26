"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import Image from "next/image";
import SubmitButton from "@/components/submitButton";
import { PostFormState } from "@/lib/types/formState";
import { toast } from "sonner"

type Props = {
    state: PostFormState;
    formAction: (payload: FormData) => void;
    postId?: number;
}

const UpsertPostForm = ({ state, formAction, postId }: Props) => {
    const [imageUrl, setImageUrl] = useState("");
    const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
    useEffect(() => {
        if (!state?.message) return;

        if (state?.ok) {
            toast.success(state.message)
        } else {
            toast.error(state.message)
        }
    }, [state])
    return (
        <form className="flex flex-col gap-5 [&>div>label]:text-slate-500" action={formAction}>
            {postId !== undefined && <input type="hidden" name="postId" value={postId} />}
            <div className="my-2 flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" type="text" required placeholder="Enter post title" defaultValue={state?.data?.title} />
            </div>
            {state?.errors?.title && (
                <p className="text-red-500 text-sm">{state.errors.title}</p>
            )}
            <div className="my-2 flex flex-col gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" required placeholder="Enter post content" rows={6} defaultValue={state?.data?.content} />
            </div>
            {state?.errors?.content && (
                <p className="text-red-500 text-sm">{state.errors.content}</p>
            )}
            <div className="my-2 flex flex-col gap-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input id="thumbnail" name="thumbnail" accept="image/*" placeholder="Choose an image" type="file"
                onChange={(e) => {
                    if (e.target.files) {
                        setImageUrl(URL.createObjectURL(e.target.files[0]));
                        setThumbnailRemoved(false);
                    }
                }} />
                {state?.data?.thumbnail && !imageUrl && !thumbnailRemoved && (
                    <div className="flex flex-col gap-2">
                        <Image src={state.data.thumbnail as string} alt="Post Thumbnail" width={200} height={150} className="rounded-md" />
                        <button type="button" onClick={() => setThumbnailRemoved(true)} className="text-red-500 text-sm underline w-fit">
                            Remove thumbnail
                        </button>
                    </div>
                )}
                { !!imageUrl && <Image src={imageUrl} alt="Post Thumbnail" width={200} height={150} className="rounded-md" /> }
                {postId !== undefined && state?.data?.thumbnail && (
                    <input type="hidden" name="existingThumbnail" value={state.data.thumbnail as string} />
                )}
                {thumbnailRemoved && <input type="hidden" name="removeThumbnail" value="on" />}
            </div>
            {state?.errors?.thumbnail && (
                <p className="text-red-500 text-sm">{state.errors.thumbnail}</p>
            )}
            <div className="my-2 flex flex-col gap-2">
                <Label htmlFor="tags">Tags</Label> 
                <Input id="tags" name="tags" type="text" placeholder="Enter post tags (comma-separated)" defaultValue={state?.data?.tags} />
            </div>
            {state?.errors?.tags && (
                <p className="text-red-500 text-sm">{state.errors.tags}</p>
            )}
            <div className="my-2 flex items-center gap-2">
                <Input id="published" name="published" type="checkbox" className="h-4 w-4" defaultChecked={!!state?.data?.published} />
                <Label htmlFor="published">Published</Label>
            </div>
            {state?.errors?.published && (
                <p className="text-red-500 text-sm">{state.errors.published}</p>
            )}
            <SubmitButton className="mt-4">Save</SubmitButton>
        </form>
    )
}

export default UpsertPostForm;