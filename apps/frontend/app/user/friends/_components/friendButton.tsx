"use client";

import {
    acceptFriendRequest,
    cancelFriendRequest,
    getFriendshipStatus,
    rejectFriendRequest,
    removeFriend,
    sendFriendRequest,
} from "@/lib/actions/friendAction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { UserPlusIcon, UserMinusIcon, ClockIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
    targetUserId: number;
    currentUserId?: number;
    friendshipId?: number;
    compact?: boolean;
    onStatusChange?: () => void;
};

const invalidateKeys = (targetUserId: number) => ([
    ["FRIENDSHIP_STATUS", targetUserId],
    ["FRIENDS"],
    ["INCOMING_FRIEND_REQUESTS"],
    ["OUTGOING_FRIEND_REQUESTS"],
    ["SEARCH_USERS"],
]);

const FriendButton = ({
    targetUserId,
    currentUserId,
    friendshipId,
    compact = false,
    onStatusChange,
}: Props) => {
    const queryClient = useQueryClient();
    const isSelf = currentUserId === targetUserId;
    const canInteract = !!currentUserId && !isSelf;

    const { data: relation, isLoading } = useQuery({
        queryKey: ["FRIENDSHIP_STATUS", targetUserId],
        queryFn: () => getFriendshipStatus(targetUserId),
        enabled: canInteract,
    });

    const resolvedFriendshipId = friendshipId ?? relation?.friendshipId ?? undefined;
    const relationStatus = relation?.status ?? "NONE";

    const invalidateAll = async () => {
        await Promise.all(
            invalidateKeys(targetUserId).map((queryKey) =>
                queryClient.invalidateQueries({ queryKey })
            )
        );
        onStatusChange?.();
    };

    const sendMutation = useMutation({
        mutationFn: () => sendFriendRequest(targetUserId),
        onSuccess: invalidateAll,
    });

    const acceptMutation = useMutation({
        mutationFn: () => {
            if (!resolvedFriendshipId) throw new Error("Missing friendship id");
            return acceptFriendRequest(resolvedFriendshipId);
        },
        onSuccess: invalidateAll,
    });

    const rejectMutation = useMutation({
        mutationFn: () => {
            if (!resolvedFriendshipId) throw new Error("Missing friendship id");
            return rejectFriendRequest(resolvedFriendshipId);
        },
        onSuccess: invalidateAll,
    });

    const cancelMutation = useMutation({
        mutationFn: () => {
            if (!resolvedFriendshipId) throw new Error("Missing friendship id");
            return cancelFriendRequest(resolvedFriendshipId);
        },
        onSuccess: invalidateAll,
    });

    const removeMutation = useMutation({
        mutationFn: () => removeFriend(targetUserId),
        onSuccess: invalidateAll,
    });

    const isPending =
        sendMutation.isPending ||
        acceptMutation.isPending ||
        rejectMutation.isPending ||
        cancelMutation.isPending ||
        removeMutation.isPending;

    const buttonClass = cn(
        "cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 border border-border rounded-sm font-mono text-xs uppercase tracking-widest transition-all duration-200",
        compact ? "px-3 py-1.5" : "px-4 py-2.5",
        "hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-50"
    );

    if (!canInteract) {
        return null;
    }

    if (isLoading) {
        return (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Loading...
            </span>
        );
    }

    if (relationStatus === "FRIENDS") {
        return (
            <button
                type="button"
                className={cn(buttonClass, "text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600")}
                onClick={() => removeMutation.mutate()}
                disabled={isPending}
            >
                <UserMinusIcon className="w-4 h-4" />
                <span>Unfriend</span>
            </button>
        );
    }

    if (relationStatus === "PENDING_SENT") {
        return (
            <button
                type="button"
                className={buttonClass}
                onClick={() => cancelMutation.mutate()}
                disabled={isPending || !resolvedFriendshipId}
            >
                <ClockIcon className="w-4 h-4" />
                <span>Cancel Request</span>
            </button>
        );
    }

    if (relationStatus === "PENDING_RECEIVED" && resolvedFriendshipId) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    className={cn(buttonClass, "bg-foreground text-background border-foreground")}
                    onClick={() => acceptMutation.mutate()}
                    disabled={isPending}
                >
                    <CheckIcon className="w-4 h-4" />
                    <span>Accept</span>
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => rejectMutation.mutate()}
                    disabled={isPending}
                >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Reject</span>
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            className={buttonClass}
            onClick={() => sendMutation.mutate()}
            disabled={isPending}
        >
            <UserPlusIcon className="w-4 h-4" />
            <span>Add Friend</span>
        </button>
    );
};

export default FriendButton;
