import { login } from "./login";
import { question } from "./question";

export const routeHandler = async (req: Request) => {
  const pathname = new URL(req.url).pathname;
  const method = req.method;

  const methodsAllowedInLogin = ["POST", "GET"];
  if (pathname.startsWith("/login") && methodsAllowedInLogin.includes(method)) {
    return login(method, req);
  }

  const methodsAllowedInQuestion = ["GET", "PUT", "POST"];
  if (pathname.startsWith("/question") && methodsAllowedInQuestion.includes(method)) {
    return question(method, req);
  }

  return {
    status: 404,
    body: "Not Found",
  };
};
