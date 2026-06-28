import { BACKEND_URL } from "./constants";

export async function graphqlRequest<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  const response = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: "no-store",
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL request failed");
  }

  return result.data as T;
}
