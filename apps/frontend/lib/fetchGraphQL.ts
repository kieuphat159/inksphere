import { BACKEND_URL } from './constants';
import { getSession } from './session';

export const fetchGraphQL = async (query: string, variables = {}) => {
    try {
        const response = await fetch(`${BACKEND_URL}/graphql`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            })
        });

        const result = await response.json();
        if (result.errors) {
            console.error("GraphQL errors:", result.errors);
            // Return errors instead of throwing so callers can handle gracefully
            return { errors: result.errors, data: result.data ?? null };
        }
        return result.data;
    } catch (err) {
        console.error("Network error:", err);
        return { errors: [{ message: "Network error. Please try again." }], data: null };
    }
}

export const authFetchGraphQL = async (query: string, variables = {}) => {
    const session = await getSession();
    if (!session?.accessToken) {
        throw new Error("Missing authenticated session");
    }
    const response = await fetch(`${BACKEND_URL}/graphql`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
            query,
            variables,
        })
    })

    const result = await response.json();
    if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error('Failed to fetch GraphQL data');
    }
    return result.data;
}