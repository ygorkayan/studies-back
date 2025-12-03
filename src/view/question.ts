import { getQuestion, putQuestion } from "../controller/question";

export const question = async (method: string, req: Request) => {
  if (method === "GET") {
    return getQuestion();
  }

  if (method === "PUT") {
    return putQuestion(req);
  }
};
