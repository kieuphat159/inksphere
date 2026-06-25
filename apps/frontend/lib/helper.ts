import { skip } from "node:test";
import { DEFAULT_PAGE_SIZE } from "./constants";

export function transformTakeSkip({
    page,
    pageSize
}: {
    page?: number;
    pageSize?: number;
}) {
    return {
        skip: ((page ?? 1) - 1) * (pageSize ?? DEFAULT_PAGE_SIZE),
        take: pageSize ?? DEFAULT_PAGE_SIZE,
    }
}

export function calculatePageNumbers({
    totalPages,
    currentPage,
    pageNeighbors,
}: {
    totalPages: number;
    currentPage: number;
    pageNeighbors: number;
}) {
    const totalNumbers = pageNeighbors * 2 + 3; // neighbors + current + first and last 
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
        const startPage = Math.max(2, currentPage - pageNeighbors);
        const endPage = Math.min(totalPages - 1, currentPage + pageNeighbors);

        let pages: (number | string)[] = Array.from(
            { length: endPage - startPage + 1 },
            (_, index) => startPage + index
        );

        if (startPage > 2) pages = ['...', ...pages];
        if (endPage < totalPages - 1) pages = [...pages, '...'];
        return [1, ...pages, totalPages];
    }
    return Array.from({ length: totalPages }, (_, index) => index + 1);
}