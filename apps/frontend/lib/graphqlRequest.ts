import { BACKEND_URL } from "./constants";

export class AuthError extends Error {
  status?: number;

  constructor(message = "Authentication required", status?: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

type GraphQLResponseError = {
  message?: string;
  extensions?: {
    code?: string;
    message?: string;
  };
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLResponseError[];
  message?: string;
};

function isAuthErrorMessage(message?: string) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("unauthor") || normalized.includes("jwt expired") || normalized.includes("token expired");
}

function isAuthGraphQLError(error: GraphQLResponseError) {
  return (
    error?.extensions?.code === "UNAUTHENTICATED" ||
    isAuthErrorMessage(error?.message) ||
    isAuthErrorMessage(error?.extensions?.message)
  );
}

function isAuthResponse(responseStatus: number, result: GraphQLResponse<unknown> | null) {
  if (responseStatus === 401 || responseStatus === 403) return true;
  return Array.isArray(result?.errors) && result.errors.some(isAuthGraphQLError);
}

export async function graphqlRequest<T = Record<string, unknown>>(
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

  let result: GraphQLResponse<T> | null = null;
  try {
    result = (await response.json()) as GraphQLResponse<T>;
  } catch {
    result = null;
  }

  if (!response.ok || result?.errors) {
    const message =
      result?.errors?.[0]?.message ||
      result?.message ||
      `GraphQL request failed with status ${response.status}`;

    if (isAuthResponse(response.status, result)) {
      throw new AuthError(message, response.status);
    }

    throw new Error(message);
  }

  return result.data as T;
}
