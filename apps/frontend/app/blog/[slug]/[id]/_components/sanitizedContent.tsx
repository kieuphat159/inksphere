"use client";

import DOMPurify from 'dompurify';

type Props = {
    content: string;
    className?: string;
};

const SanitizedContent = (props: Props) => {
    const cleanHTML = DOMPurify.sanitize(props.content);
    return (
        <div className={props.className} dangerouslySetInnerHTML={{ __html: cleanHTML }} />
    );
}

export default SanitizedContent;