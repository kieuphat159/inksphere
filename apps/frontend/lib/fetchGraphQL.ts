import { getSession } from './session';
import { AuthError, graphqlRequest } from './graphqlRequest';
import { redirect } from 'next/navigation';

export const fetchGraphQL = async (query: string, variables = {}): Promise<any> => {
    try {
        return await graphqlRequest(query, variables);
    } catch (err) {
        if (err instanceof AuthError) {
            throw err;
        }
        console.error("Network error:", err);
        return { errors: [{ message: "Network error. Please try again." }], data: null };
    }
}

export const authFetchGraphQL = async (query: string, variables = {}): Promise<any> => {
    const session = await getSession();
    if (!session?.accessToken) {
        redirect('/auth/signin');
    }
    try {
        return await graphqlRequest(query, variables, {
            Authorization: `Bearer ${session.accessToken}`,
        });
    } catch (err) {
        if (err instanceof AuthError) {
            redirect('/api/auth/signout');
        }
        throw err;
    }
}

export function handleActionError(error: any, logMessage: string, fallbackValue: any = null) {
    if (error && typeof error === 'object' && 'digest' in error && String(error.digest).startsWith('NEXT_REDIRECT')) {
        throw error;
    }
    console.error(logMessage, error);
    return fallbackValue;
}
