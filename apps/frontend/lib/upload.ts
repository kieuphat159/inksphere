import { createClient } from "@supabase/supabase-js";

export async function uploadThumbnail(image: File) {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseApiKey = process.env.SUPABASE_API_KEY!;
    const supabase = createClient(supabaseUrl, supabaseApiKey);

    const data = await supabase.storage.from("thumbnails").upload(`${image.name}_${Date.now()}`, image);
    if (!data.data?.path) {
        throw new Error("Failed to upload thumbnail");
    }
    const urlData = await supabase.storage.from("thumbnails").getPublicUrl(data.data?.path!);
    return urlData.data.publicUrl;
}