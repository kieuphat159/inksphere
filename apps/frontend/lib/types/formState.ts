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