import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentEntity } from '@/lib/types/modelTypes';
import { UserIcon } from '@heroicons/react/24/outline';

type Props = {
    comment: CommentEntity;
}

const CommentCard = ({ comment }: Props) => {
    return (
        <div className='p-2 shadow rounded'>
            <div className='flex gap-2 text-slate-500 items-center'>
                <Avatar className='border-2'>
                    <AvatarImage src={comment.author.avatar || undefined} />
                    <AvatarFallback>
                        <UserIcon className='w-6 h-6' />
                    </AvatarFallback>
                </Avatar>
                <p>{comment.author.name} | </p>
                <p>{new Date(comment.createdAt).toLocaleDateString()}</p>
            </div>
            <p className='mt-4'>{comment.content}</p>
        </div>
    )
}

export default CommentCard;