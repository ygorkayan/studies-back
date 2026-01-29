import { checkLogin, checkToken } from "../controller/login";

export const login = async (method: string, req: Request) => {
  if (method === "POST") {
    return checkLogin(req);
  }

  if (method === "GET") {
    return checkToken(req);
  }
};
