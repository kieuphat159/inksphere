import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentEntity } from '@/lib/types/modelTypes';
import { UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Props = {
    comment: CommentEntity;
}

const CommentCard = ({ comment }: Props) => {
    return (
        <div className='py-4 border-b border-border/40 flex flex-col items-start text-left w-full'>
            <Link href={`/user/${encodeURIComponent(comment.author.name)}`} className='flex gap-3 text-muted-foreground items-center mb-2 hover:opacity-80 transition-opacity'>
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
        </div>
    )
}

export default CommentCard;
