export const routeHandler = async (req: Request, env: Env) => {
  const url = new URL(req.url);
  console.log("url", url?.pathname);


  return { test: "This is a test response from src/view/index.ts" };
};
