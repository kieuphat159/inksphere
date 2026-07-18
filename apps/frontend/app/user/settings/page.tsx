"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientSession } from "@/lib/actions/sessionAction";
import { SessionUser } from "@/lib/types/modelTypes";
import { updateUserAction } from "@/lib/actions/profileAction";
import { uploadAvatar } from "@/lib/upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SettingsPage = () => {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const session = await getClientSession();
      if (!session?.user) {
        toast.error("Please sign in to access settings.");
        router.push("/auth/signin");
      } else {
        setSessionUser(session.user);
        setName(session.user.name || "");
        setBio(session.user.bio || "");
        setAvatarUrl(session.user.avatar || "");
      }
      setIsChecking(false);
    };
    checkUser();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsPending(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        toast.loading("Uploading new avatar...", { id: "avatar-upload" });
        finalAvatarUrl = await uploadAvatar(avatarFile);
        toast.success("Avatar uploaded successfully", { id: "avatar-upload" });
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("avatar", finalAvatarUrl);

      const res = await updateUserAction(formData);
      if (res.ok) {
        toast.success("Profile updated successfully!");
        // Redirect to their profile page to view changes
        router.push(`/user/${encodeURIComponent(name)}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-16 w-full flex-grow flex flex-col">
      <div className="border-b border-border/60 pb-6 mb-8">
        <h1 className="font-serif text-3xl font-black text-foreground">
          Profile Settings
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
          Update your public profile details and profile picture.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6 p-4 border border-border/60 bg-muted/5 rounded-none">
          <Avatar className="w-20 h-20 border border-border">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>
              <User className="w-10 h-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="avatar-upload-input"
              className="font-mono text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 px-4 py-2 cursor-pointer transition-colors w-fit font-bold rounded-none"
            >
              Choose Avatar
            </Label>
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
              JPG, PNG, or WEBP. Max 2MB.
            </span>
          </div>
        </div>

        {/* Display Name Input */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Display Name
          </Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter display name"
            className="border-border focus-visible:ring-foreground/10"
          />
        </div>

        {/* Bio Input */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Short Biography
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short biography..."
            rows={5}
            className="border-border focus-visible:ring-foreground/10 font-serif leading-relaxed"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="mt-4 w-full font-mono text-xs uppercase tracking-widest py-6 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer rounded-none"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Changes
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </main>
  );
};

export default SettingsPage;
