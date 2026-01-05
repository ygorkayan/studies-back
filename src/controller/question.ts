import { env } from "cloudflare:workers";

export const getQuestion = async () => {
  const query = "select id, question, answer from flash_cards order by controller LIMIT 1";

  const result = await env.studies_back.prepare(query).all();

  return {
    status: 200,
    body: result.results[0],
  };
};

export const putQuestion = async (req: Request) => {
  const idString = new URL(req.url).pathname.replace(/^\/question\//, "");
  const id = Number(idString);

  if (isNaN(id)) {
    return {
      status: 400,
      body: "Invalid ID",
    };
  }

  const queryToGet = "select question, answer, controller from flash_cards where id = ?";
  const result = await env.studies_back.prepare(queryToGet).bind(id).all();

  if (!result.results || result.results.length === 0) {
    return {
      status: 404,
      body: "No questions found",
    };
  }

  let body: Record<string, any> | null;

  try {
    body = await req.json();
  } catch (error) {
    return {
      status: 400,
      body: "Invalid JSON body",
    };
  }

  const oldQuestion = result.results[0].question as string;
  const oldAnswer = result.results[0].answer as string;

  const newQuestion = body?.question ?? oldQuestion;
  const newAnswer = body?.answer ?? oldAnswer;
  let newController = result.results[0].controller as number;

  const bodyController = body?.controller;

  if (bodyController === "correct") {
    newController += 1;
  } else if (bodyController === "incorrect" && newController > 0) {
    newController -= 1;
  }

  const queryToUpdate = `
    UPDATE flash_cards
    SET question = ?, answer = ?, controller = ?
    WHERE id = ?;
  `;

  const update = await env.studies_back.prepare(queryToUpdate).bind(newQuestion, newAnswer, newController, id).all();

  if (update.success) {
    return {
      status: 200,
    };
  } else {
    return {
      status: 500,
      body: "Failed to update question",
    };
  }
};
