import { SessionUser } from "@/lib/session"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserIcon } from "@heroicons/react/24/outline";
import { de } from "zod/v4/locales";

type Props = {
    user: SessionUser
}

const Profile = ({ user }: Props) => {
    return (
        <Popover>
            <PopoverTrigger>
                <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                        <UserIcon className="w-8 text-slate-500"/>
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent>
                {user.name}
            </PopoverContent>
        </Popover>
    );
}

export default Profile;