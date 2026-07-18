"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentEntity } from '@/lib/types/modelTypes';
import { SessionUser } from '@/lib/session';
import { UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';
import ReplyComment from './replyComment';

type Props = {
    comment: CommentEntity;
    postId: number;
    user?: SessionUser;
    refetch: () => void;
}

const CommentCard = ({ comment, postId, user, refetch }: Props) => {
    const [isReplying, setIsReplying] = useState(false);
    const canReply = !!user && !comment.parentId; // only allow replies to top-level comments

    return (
        <div className='py-4 border-b border-border/40 flex flex-col items-start text-left w-full'>
            <div className="w-full">
                <Link href={`/user/${encodeURIComponent(comment.author.name)}`} className='flex gap-3 text-muted-foreground items-center mb-2 hover:opacity-80 transition-opacity w-fit'>
                    <Avatar className='border border-border w-7 h-7'>
                        <AvatarImage src={comment.author.avatar || undefined} />
                        <AvatarFallback>
                            <UserIcon className='w-4 h-4' />
                        </AvatarFallback>
                    </Avatar>
                    <div className="font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{comment.author.name}</span>
                        <span className="text-border">|</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                </Link>
                <p className='font-serif text-sm text-foreground/90 leading-relaxed pl-10'>{comment.content}</p>
                
                {canReply && (
                    <div className="pl-10 mt-1">
                        {!isReplying ? (
                            <button
                                onClick={() => setIsReplying(true)}
                                className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Reply
                            </button>
                        ) : (
                            <ReplyComment
                                postId={postId}
                                parentId={comment.id}
                                user={user}
                                onSuccess={() => {
                                    setIsReplying(false);
                                    refetch();
                                }}
                                onCancel={() => setIsReplying(false)}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Render Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="pl-10 mt-4 w-full flex flex-col gap-4 border-l border-border/30">
                    {comment.replies.map((reply) => (
                        <CommentCard
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            user={user}
                            refetch={refetch}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommentCard;
