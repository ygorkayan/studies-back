import { decrypt } from "./crypto";
import { Token } from "./types";
import { env } from "cloudflare:workers";

export const checkAuthorization = async (body: Record<string, any> | null): Promise<boolean> => {
  if (!body?.token) {
    return false;
  }

  let data: Token;

  try {
    data = await decrypt(body.token);
  } catch (e) {
    return false;
  }

  const now = Date.now();

  if (data.expiration < now) {
    return false;
  }

  const queryToGetUser = "select id, user from users where id = ? AND user = ?";

  let result;
  try {
    result = await env.studies_back.prepare(queryToGetUser).bind(data.userId, data.user).all();
  } catch (error) {
    return false;
  }

  if (result.results?.length === 0) {
    return false;
  }

  return true;
};
