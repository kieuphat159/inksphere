import {
    fetchFriends,
    fetchIncomingFriendRequests,
    fetchOutgoingFriendRequests,
} from "@/lib/actions/friendAction";
import { getSession } from "@/lib/session";
import FriendsPanel from "./_components/friendsPanel";

const FriendsPage = async () => {
    const session = await getSession();
    const [friends, incoming, outgoing] = await Promise.all([
        fetchFriends(),
        fetchIncomingFriendRequests(),
        fetchOutgoingFriendRequests(),
    ]);

    return (
        <FriendsPanel
            currentUserId={Number(session!.user!.id!)}
            initialFriends={friends}
            initialIncoming={incoming}
            initialOutgoing={outgoing}
        />
    );
};

export default FriendsPage;
