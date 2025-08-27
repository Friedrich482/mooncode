import { TrpcAuthError } from "./types";
import { loginResponseSchema } from "./schemas";

const fetchJWTToken = async (
  endpointURL: string,
  body: {
    email: string;
    password: string;
    username?: string;
    callbackUrl: string | null;
  },
) => {
  const { email, password, username, callbackUrl } = body;
  const res = await fetch(endpointURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // we pass json here because of superjson transformer
      json: username
        ? {
            email,
            password,
            username,
            callbackUrl,
          }
        : {
            email,
            password,
            callbackUrl,
          },
    }),
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = (await res.json()) as TrpcAuthError;
    const message = errorData?.error?.json?.message || "Authentication failed";
    throw new Error(message);
  }
  const data = await res.json();

  if (callbackUrl) {
    try {
      const {
        result: {
          data: {
            json: { access_token },
          },
        },
      } = loginResponseSchema.parse(data);

      return access_token;
    } catch (error) {
      throw new Error(
        `Failed to parse login response ${error instanceof Error ? error.message : error}`,
      );
    }
  }
};

export default fetchJWTToken;
