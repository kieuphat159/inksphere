"use client";

import { Friendship, User } from "@/lib/types/modelTypes";
import {
    fetchFriends,
    fetchIncomingFriendRequests,
    fetchOutgoingFriendRequests,
    removeFriend,
    searchUsers,
} from "@/lib/actions/friendAction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FriendButton from "./friendButton";

type Tab = "friends" | "requests" | "search";

type Props = {
    currentUserId: number;
    initialFriends: User[];
    initialIncoming: Friendship[];
    initialOutgoing: Friendship[];
};

const UserRow = ({
    user,
    children,
}: {
    user: User;
    children?: React.ReactNode;
}) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/60 last:border-b-0">
        <Link href={`/user/${encodeURIComponent(user.name)}`} className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity flex-1">
            <Avatar className="border border-border size-10">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback>
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <p className="font-serif font-bold truncate">{user.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                    {user.email}
                </p>
            </div>
        </Link>
        {children}
    </div>
);

const FriendsPanel = ({
    currentUserId,
    initialFriends,
    initialIncoming,
    initialOutgoing,
}: Props) => {
    const [activeTab, setActiveTab] = useState<Tab>("friends");
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();

    const { data: friends = initialFriends } = useQuery({
        queryKey: ["FRIENDS"],
        queryFn: fetchFriends,
        initialData: initialFriends,
    });

    const { data: incoming = initialIncoming } = useQuery({
        queryKey: ["INCOMING_FRIEND_REQUESTS"],
        queryFn: fetchIncomingFriendRequests,
        initialData: initialIncoming,
    });

    const { data: outgoing = initialOutgoing } = useQuery({
        queryKey: ["OUTGOING_FRIEND_REQUESTS"],
        queryFn: fetchOutgoingFriendRequests,
        initialData: initialOutgoing,
    });

    const { data: searchResults = [], isFetching: isSearching } = useQuery({
        queryKey: ["SEARCH_USERS", searchQuery],
        queryFn: () => searchUsers(searchQuery),
        enabled: activeTab === "search" && searchQuery.trim().length >= 2,
    });

    const removeMutation = useMutation({
        mutationFn: (friendId: number) => removeFriend(friendId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["FRIENDS"] });
        },
    });

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: "friends", label: "Friends", count: friends.length },
        {
            id: "requests",
            label: "Requests",
            count: incoming.length + outgoing.length,
        },
        { id: "search", label: "Find People" },
    ];

    return (
        <div className="w-full max-w-2xl">
            <div className="mb-8 text-center">
                <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight mb-2">
                    Friends
                </h1>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Connect with other writers on InkSphere
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "font-mono text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-border transition-colors",
                            activeTab === tab.id
                                ? "bg-foreground text-background border-foreground"
                                : "hover:border-foreground"
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="ml-2 opacity-70">({tab.count})</span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === "friends" && (
                <div>
                    {friends.length === 0 ? (
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center py-8">
                            No friends yet
                        </p>
                    ) : (
                        friends.map((friend) => (
                            <UserRow key={friend.id} user={friend}>
                                <button
                                    type="button"
                                    onClick={() => removeMutation.mutate(friend.id)}
                                    disabled={removeMutation.isPending}
                                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 border border-border text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors disabled:opacity-50"
                                >
                                    Unfriend
                                </button>
                            </UserRow>
                        ))
                    )}
                </div>
            )}

            {activeTab === "requests" && (
                <div className="flex flex-col gap-8">
                    <section>
                        <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                            Incoming ({incoming.length})
                        </h2>
                        {incoming.length === 0 ? (
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground py-4">
                                No incoming requests
                            </p>
                        ) : (
                            incoming.map((request) => (
                                <UserRow key={request.id} user={request.requester}>
                                    <FriendButton
                                        targetUserId={request.requester.id}
                                        currentUserId={currentUserId}
                                        friendshipId={request.id}
                                        compact
                                    />
                                </UserRow>
                            ))
                        )}
                    </section>

                    <section>
                        <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                            Sent ({outgoing.length})
                        </h2>
                        {outgoing.length === 0 ? (
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground py-4">
                                No sent requests
                            </p>
                        ) : (
                            outgoing.map((request) => (
                                <UserRow key={request.id} user={request.receiver}>
                                    <FriendButton
                                        targetUserId={request.receiver.id}
                                        currentUserId={currentUserId}
                                        friendshipId={request.id}
                                        compact
                                    />
                                </UserRow>
                            ))
                        )}
                    </section>
                </div>
            )}

            {activeTab === "search" && (
                <div>
                    <div className="relative mb-6">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-3 border border-border bg-background font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                    </div>

                    {searchQuery.trim().length < 2 ? (
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center py-8">
                            Type at least 2 characters to search
                        </p>
                    ) : isSearching ? (
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center py-8">
                            Searching...
                        </p>
                    ) : searchResults.length === 0 ? (
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center py-8">
                            No users found
                        </p>
                    ) : (
                        searchResults.map((user) => (
                            <UserRow key={user.id} user={user}>
                                <FriendButton
                                    targetUserId={user.id}
                                    currentUserId={currentUserId}
                                    compact
                                />
                            </UserRow>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FriendsPanel;
