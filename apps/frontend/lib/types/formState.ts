export type SignUpFormState = | {
    data: {
        name?: string;
        email?: string;
        password?: string;
    };
    errors: {
        name?: string[];
        email?: string[];
        password?: string[];
    };
    message?: string;
} | undefined;

export type CreateCommentFormState = | {
    data?: {
        content?: string;
        postId?: number;
    };
    errors?: {
        content?: string[]; 
    }
    message?: string;
    ok?: boolean;
    open?: boolean;
} | undefined;

export type PostFormState = | {
    data?: {
        postId?: number;
        title?: string;
        content?: string;
        thumbnail?: File | string | null;
        tags?: string;
        published?: "on" | boolean | undefined;
    },
    errors?: {
        title?: string[];
        content?: string[];
        thumbnail?: string[];
        tags?: string[];
        published?: string[];
    },
    message?: string;
    ok?: boolean;
} | undefined;