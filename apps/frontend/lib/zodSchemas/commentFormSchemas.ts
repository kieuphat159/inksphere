import z from "zod";

export const CreateCommentFormSchema = z.object({
    content: z.string().min(1, "Content is required").trim(),
    postId: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), "Invalid post ID"),
    parentId: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});