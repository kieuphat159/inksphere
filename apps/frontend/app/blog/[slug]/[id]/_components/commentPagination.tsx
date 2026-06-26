import { calculatePageNumbers } from "@/lib/helper";
import { cn } from "@/lib/utils";
import ChevronLeftIcon from "@heroicons/react/24/outline/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";

type Props = {
    totalPages: number;
    currentPage: number;
    pageNeighbors?: number;
    setCurrentPage: (page: number) => void;
    className?: string;
}

const CommentPagination = ({
    totalPages,
    currentPage,
    pageNeighbors = 2,
    setCurrentPage,
    className
}: Props) => {
    const pageNumbers = calculatePageNumbers({ totalPages, currentPage, pageNeighbors });
    const handleClick = (page: number | string) => {
        if (typeof page === "number" && page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    }
    return (
        <div className={cn("flex items-center justify-center gap-2 font-mono text-xs", className)}>
            {currentPage !== 1 && (
                <button
                    onClick={() => handleClick(currentPage - 1)}
                    className="p-2 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-200 flex items-center justify-center rounded-sm cursor-pointer"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
            )}

            {pageNumbers.map((page, index) => (
                page === '...' ? (
                    <span key={index} className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                    <button
                        key={index}
                        onClick={() => handleClick(page)}
                        className={cn(
                            "px-3 py-2 border border-border hover:border-foreground transition-all duration-200 rounded-sm text-center min-w-[34px] cursor-pointer",
                            {
                                "bg-foreground text-background border-foreground font-bold": currentPage === page,
                                "hover:bg-foreground hover:text-background": currentPage !== page
                            }
                        )}
                    >
                        {page}
                    </button>
                )
            ))}

            {currentPage !== totalPages && (
                <button 
                    onClick={() => handleClick(currentPage + 1)} 
                    className="p-2 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-200 flex items-center justify-center rounded-sm cursor-pointer"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}

export default CommentPagination;