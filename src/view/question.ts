import { checkAuthorization } from "../helpers/checkAuthorization";
import { getQuestion, putQuestion } from "../controller/question";

export const question = async (method: string, req: Request) => {
  let body: Record<string, any> | null;
  let allowed;

  try {
    body = await req.json();
    allowed = await checkAuthorization(body);
  } catch (error) {
    body = null;
    allowed = false;
  }

  if (!allowed) {
    return { status: 401, body: "Unauthorized" };
  }

  if (method === "POST") {
    return getQuestion();
  }

  if (method === "PUT") {
    return putQuestion(req, body);
  }
};
