import { checkAuthorization } from "../helpers/checkAuthorization";
import { getQuestion, putQuestion } from "../controller/question";

export const question = async (method: string, req: Request) => {
  try {
    const allowed = await checkAuthorization(req.headers.get("token"));

    if (!allowed) {
      return { status: 401, body: "Unauthorized" };
    }
  } catch (error) {
    return { status: 401, body: "Unauthorized" };
  }

  if (method === "POST") {
    return getQuestion();
  }

  if (method === "PUT") {
    return putQuestion(req);
  }
};
