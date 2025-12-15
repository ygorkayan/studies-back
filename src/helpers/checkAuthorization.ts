import { decrypt } from "./crypto";
import { Token } from "./types";
import { env } from "cloudflare:workers";

export const checkAuthorization = async (body: Record<string, any> | null): Promise<boolean> => {
  if (!body?.token) {
    return false;
  }

  const data: Token = await decrypt(body.token);

  const now = Date.now();

  if (data.expiration < now) {
    return false;
  }

  const queryToGetUser = "select id, user from users where id = ? AND user = ?";

  const result = await env.studies_back.prepare(queryToGetUser).bind(data.userId, data.user).all();

  if (result.results?.length === 0) {
    return false;
  }

  return true;
};
