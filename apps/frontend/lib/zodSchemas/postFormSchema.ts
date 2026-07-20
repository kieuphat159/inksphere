import { z } from "zod";

export const PostFormSchema = z.object({
    title: z.string().min(5).max(100),
    content: z.string().min(10),
    tags: z.string().min(1).refine(val => val.split(",").every(tag => tag.trim() !== "")).transform(val => val.split(",").map(tag => tag.trim())),
    thumbnail: z.preprocess(
        (val) => (val instanceof File && val.size === 0 ? undefined : val),
        z.instanceof(File).optional()
    ),
    published: z.preprocess(
        (val) => val === "on",
        z.boolean().default(false)
    )
})