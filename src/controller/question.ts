import { env } from "cloudflare:workers";

export const getQuestion = async () => {
  const query = "select id, question, answer from flash_cards order by controller LIMIT 1";

  const result = await env.studies_back.prepare(query).all();

  return {
    status: 200,
    body: result.results[0],
  };
};

export const putQuestion = async (req: Request, body: Record<string, any> | null) => {
  const idString = new URL(req.url).pathname.replace(/^\/question\//, "");
  const id = Number(idString);

  if (isNaN(id)) {
    return {
      status: 400,
      body: "Invalid ID",
    };
  }

  const queryToGet = "select controller from flash_cards where id = ?";
  const result = await env.studies_back.prepare(queryToGet).bind(id).all();

  if (!result.results || result.results.length === 0) {
    return {
      status: 404,
      body: "No questions found",
    };
  }

  let controller = result.results[0].controller;

  let data;
  let answer: "correct" | "incorrect";

  try {
    data = body as Record<string, "correct" | "incorrect">;
    answer = data.answer;
  } catch (error) {
    return {
      status: 400,
      body: "Invalid JSON body",
    };
  }

  if (answer !== "correct" && answer !== "incorrect") {
    return {
      status: 400,
      body: "Invalid answer value",
    };
  }

  if (answer === "correct") {
    controller = controller + 1;
  } else if (answer === "incorrect" && controller > 0) {
    controller = controller - 1;
  }

  const queryToUpdate = `
    UPDATE flash_cards
    SET controller = ?
    WHERE id = ?;
  `;

  const update = await env.studies_back.prepare(queryToUpdate).bind(controller, id).all();

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
