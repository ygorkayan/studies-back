import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { routeHandler } from "./view";

/**
 * Welcome to Cloudflare Workers! This is your first Workflows application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Workflow in action
 * - Run `npm run deploy` to publish your application
 *
 * Learn more at https://developers.cloudflare.com/workflows
 */

// User-defined params passed to your Workflow
type Params = {
  email: string;
  metadata: Record<string, string>;
};

export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // Can access bindings on `this.env`
    // Can access params on `event.payload`

    const files = await step.do("my first step", async () => {
      // Fetch a list of files from $SOME_SERVICE
      return {
        inputParams: event,
        files: [
          "doc_7392_rev3.pdf",
          "report_x29_final.pdf",
          "memo_2024_05_12.pdf",
          "file_089_update.pdf",
          "proj_alpha_v2.pdf",
          "data_analysis_q2.pdf",
          "notes_meeting_52.pdf",
          "summary_fy24_draft.pdf",
        ],
      };
    });

    // You can optionally have a Workflow wait for additional data,
    // human approval or an external webhook or HTTP request, before progressing.
    // You can submit data via HTTP POST to /accounts/{account_id}/workflows/{workflow_name}/instances/{instance_id}/events/{eventName}
    const waitForApproval = await step.waitForEvent("request-approval", {
      type: "approval", // define an optional key to switch on
      timeout: "1 minute", // keep it short for the example!
    });

    const apiResponse = await step.do("some other step", async () => {
      let resp = await fetch("https://api.cloudflare.com/client/v4/ips");
      return await resp.json<any>();
    });

    await step.sleep("wait on something", "1 minute");

    await step.do(
      "make a call to write that could maybe, just might, fail",
      // Define a retry strategy
      {
        retries: {
          limit: 5,
          delay: "5 second",
          backoff: "exponential",
        },
        timeout: "15 minutes",
      },
      async () => {
        // Do stuff here, with access to the state from our previous steps
        if (Math.random() > 0.5) {
          throw new Error("API call to $STORAGE_SYSTEM failed");
        }
      }
    );
  }
}

const corsHeaders = (origin: string) => {
  const allowedOrigins = ["http://localhost:5173", "https://studies-front.pages.dev"];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("Origin");
    const headers = corsHeaders(origin || "");

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const result = await routeHandler(req, env);

    return new Response(JSON.stringify(result), {
      status: result?.status || 500,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  },
};
