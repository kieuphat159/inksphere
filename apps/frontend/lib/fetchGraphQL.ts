import { getSession } from './session';
import { graphqlRequest } from './graphqlRequest';

export const fetchGraphQL = async (query: string, variables = {}) => {
    try {
        return await graphqlRequest<any>(query, variables);
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
    return graphqlRequest<any>(query, variables, {
        Authorization: `Bearer ${session.accessToken}`,
    });
}
