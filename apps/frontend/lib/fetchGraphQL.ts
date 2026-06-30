import { getSession } from './session';
import { AuthError, graphqlRequest } from './graphqlRequest';
import { redirect } from 'next/navigation';

export const fetchGraphQL = async <T = Record<string, unknown>>(query: string, variables = {}) => {
    try {
        return await graphqlRequest<T>(query, variables);
    } catch (err) {
        if (err instanceof AuthError) {
            throw err;
        }
        console.error("Network error:", err);
        return { errors: [{ message: "Network error. Please try again." }], data: null };
    }
}

export const authFetchGraphQL = async <T = Record<string, unknown>>(query: string, variables = {}) => {
    const session = await getSession();
    if (!session?.accessToken) {
        redirect('/auth/signin');
    }
    try {
        return await graphqlRequest<T>(query, variables, {
            Authorization: `Bearer ${session.accessToken}`,
        });
    } catch (err) {
        if (err instanceof AuthError) {
            redirect('/api/auth/signout');
        }
        throw err;
    }
}
