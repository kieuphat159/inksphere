import Image from 'next/image';
import { Post } from '@/lib/types/modelTypes';
import Link from 'next/link';

type Props = Partial<Post>;

export default function PostCard({
    id,
    title,
    thumbnail,
    slug,
    content,
    createdAt
}: Props) {
    return (
        <div className='group flex flex-col border border-border bg-card text-card-foreground rounded-sm overflow-hidden transition-all duration-300 hover:border-foreground/30'>
            <div className='relative aspect-[16/10] overflow-hidden border-b border-border bg-muted'>
                <Image 
                    src={thumbnail ?? "/no-image.png"} 
                    alt={title ?? ""} 
                    fill 
                    className="object-cover group-hover:scale-103 transition-all duration-700 ease-out"
                />
            </div>
            <div className='p-6 flex-grow flex flex-col items-start text-left'>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    {new Date(createdAt ?? "").toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <h3 className='font-serif text-xl font-bold leading-snug tracking-tight text-foreground break-words group-hover:underline decoration-1 underline-offset-4'>
                    {title}
                </h3>
                <p className='mt-3 font-serif text-sm text-muted-foreground leading-relaxed break-words line-clamp-3'>
                    {content?.slice(0, 110)}...
                </p>
                <Link 
                    className='font-mono text-[11px] uppercase tracking-widest font-bold text-foreground hover:underline underline-offset-4 mt-6 pt-2 border-t border-border/40 w-full block' 
                    href={`/blog/${slug}/${id}`}
                >
                    Read Essay →
                </Link>
            </div>
        </div>
    );
}