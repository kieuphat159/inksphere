"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

type Props = {
    content: string;
    className?: string;
};

const SanitizedContent = ({ content, className }: Props) => {
    const [cleanHTML, setCleanHTML] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const purify = DOMPurify(window);
            setCleanHTML(purify.sanitize(content));
        }
    }, [content]);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: cleanHTML }}
        />
    );
};

export default SanitizedContent;