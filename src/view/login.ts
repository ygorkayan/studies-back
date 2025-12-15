import { checkLogin } from "../controller/login";

export const login = async (method: string, req: Request) => {
  if (method === "GET") {
    return checkLogin(req);
  }
};
