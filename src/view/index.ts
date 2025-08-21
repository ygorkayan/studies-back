export const routeHandler = async (req: Request, env: Env) => {
  const url = new URL(req.url);
  //console.log("url", url?.pathname);


  return { test: "test" };
};
