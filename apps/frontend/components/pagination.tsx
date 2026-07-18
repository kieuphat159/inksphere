import { calculatePageNumbers } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

type Props = {
    totalPages: number;
    currentPage: number;
    pageNeighbors?: number;
    baseUrl?: string;
    className?: string;
};

const Pagination = ({
    totalPages,
    currentPage,
    pageNeighbors = 2,
    baseUrl = "",
    className
}: Props) => {
    const pageNumbers = calculatePageNumbers({
        totalPages,
        currentPage,
        pageNeighbors
    });

    const getHref = (page: number | string) => {
        if (!baseUrl) return `?page=${page}`;
        const separator = baseUrl.includes("?") ? "&" : "?";
        return `${baseUrl}${separator}page=${page}`;
    };

    return (
        <div className={cn("flex items-center justify-center gap-2 font-mono text-xs", className)}>
            {currentPage !== 1 && (
                <Link 
                    href={getHref(currentPage - 1)}
                    className="p-2 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-200 flex items-center justify-center rounded-sm"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </Link>
            )}

            {pageNumbers.map((page, index) => (
                page === '...' ? (
                    <span key={index} className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                    <Link
                        key={index}
                        href={getHref(page)}
                        className={cn(
                            "px-3 py-2 border border-border hover:border-foreground transition-all duration-200 rounded-sm text-center min-w-[34px]",
                            {
                                "bg-foreground text-background border-foreground font-bold": currentPage === page,
                                "hover:bg-foreground hover:text-background": currentPage !== page
                            }
                        )}
                    >
                        {page}
                    </Link>
                )
            ))}

            {currentPage !== totalPages && (
                <Link 
                    href={getHref(currentPage + 1)}
                    className="p-2 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-200 flex items-center justify-center rounded-sm"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </Link>
            )}
        </div>
    )
}

export default Pagination;