export type Post = {
    id: number;
    title: string;
    slug?: string;
    thumbnail?: string;
    content: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: User;
    tags?: Tag[];
    _count: {
        comments: number;
        likes: number;
    }
}

export type User = {
    id: number;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type Tag = {
    id: number;
    name: string;
}

export type CommentEntity = {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: User;
    post: Post;
}

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type FriendshipRelationStatus =
    | 'NONE'
    | 'PENDING_SENT'
    | 'PENDING_RECEIVED'
    | 'FRIENDS';

export type FriendshipRelation = {
    status: FriendshipRelationStatus;
    friendshipId?: number | null;
}

export type Friendship = {
    id: number;
    status: FriendshipStatus;
    createdAt: Date;
    requester: User;
    receiver: User;
}