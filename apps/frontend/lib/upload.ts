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

export async function uploadAvatar(image: File) {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseApiKey = process.env.SUPABASE_API_KEY!;
    const supabase = createClient(supabaseUrl, supabaseApiKey);

    let path = "";
    try {
        const data = await supabase.storage.from("avatars").upload(`${image.name}_${Date.now()}`, image);
        if (data.data?.path) {
            path = data.data.path;
            const urlData = await supabase.storage.from("avatars").getPublicUrl(path);
            return urlData.data.publicUrl;
        }
    } catch (e) {
        // ignore and fallback
    }

    // Fallback to thumbnails bucket if avatars is not configured
    const fbData = await supabase.storage.from("thumbnails").upload(`${image.name}_${Date.now()}`, image);
    if (!fbData.data?.path) {
        throw new Error("Failed to upload avatar");
    }
    const urlData = await supabase.storage.from("thumbnails").getPublicUrl(fbData.data.path);
    return urlData.data.publicUrl;
}