import { env } from "cloudflare:workers";
import { encrypt, encryptPassword } from "../helpers/crypto";
import { Login, Token } from "../helpers/types";

const FIVE_HOURS_IN_MS = 5 * 60 * 60 * 1000;

export const checkLogin = async (req: Request) => {
  let user;
  let password;

  try {
    const body = (await req.json()) as Login;

    user = body?.user;
    password = await encryptPassword(body?.password);
  } catch (error) {
    return {
      status: 400,
      body: "Invalid JSON",
    };
  }

  if (!user || !password) {
    return {
      status: 400,
      body: "Missing user or password",
    };
  }

  const queryToGetUser =
    "select id, user, password_encrypted as password from users where user = ? AND password_encrypted = ?";

  const result = await env.studies_back.prepare(queryToGetUser).bind(user, password).all();

  const userResult = result.results?.[0] as Login | undefined;

  if (!userResult) {
    return {
      status: 401,
      body: "Invalid credentials",
    };
  }

  const token: Token = {
    userId: userResult.id,
    user: userResult.user,
    expiration: Date.now() + FIVE_HOURS_IN_MS,
  };

  return {
    status: 200,
    body: await encrypt(token),
  };
};
