import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import https from "https";
import { createToolSuccessResponse } from "../../utils/response-formatter.js";
import { swaggerDocument } from "./swagger.js";

// Create an HTTPS agent that ignores SSL errors
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Type definition for Swagger operation input
type SwaggerOperationInput = {
  path: string;
  method: string;
  operation: any;
};

// Handler for API call tool
async function apiCallToolHandler(_args: any, _extra: any) {
  console.log({ _args, _extra });

  const query = new URLSearchParams();
  try {
    for (const arg in _args) {
      if (arg !== 'url') query.append(arg, _args[arg]);
    }
    const response = await axios.get(`https://localhost:4050${_args.url}?${query.toString()}`, { httpsAgent });
    const responseData = response.data;

    // Use the utility to create a standardized response
    return createToolSuccessResponse(responseData);
  } catch (error) {
    console.error("Error making API call:", error);
    throw new Error("Failed to fetch data from the API");
  }
}

// Tool parameters
export const params = {
  name: "swaggert_api_call",
  description: "Use this for API calls.",
  args: {},
  handler: apiCallToolHandler,
};

// Function to break down arguments
const breakDownArgs = (path: any) => {
  const header: Record<string, any> = {};
  const query: Record<string, any> = {};

  const zodDs = (i: string): { header: { number: any; string: any }; query: { number: any; string: any } } => ({
    header: {
      number: z.number().describe(`${i} Use for the header`),
      string: z.string().describe(`${i} Use for the header`),
    },
    query: {
      number: z.number().describe(`${i} as query params`),
      string: z.string().describe(`${i} as query params`),
    },
  });

  path
    .filter((i: { in: "header" | "query"; name: string; schema: any }) => i.in === "header")
    .forEach((i: { name: string; desciption: string, schema: { default: any, type: "string" | "number" } }) => {
      header[i.name] = z.any().default(i.schema.default).describe(i.desciption);
    });

  path
    .filter((i: { in: "header" | "query" }) => i.in === "query")
    .forEach((i: { name: string; description: string }) => {
      console.log({ i })
      query[i.name] = z.string().describe(i.description);
    });
  console.log({ query })
  if (Object.keys(query).length) {
    return { loginToken: z.string().describe("used as token for the header"), ...query };
  }

  return {
    loginToken: z.string().describe("used as token for the header"),
  };
};

// Function to register tools
const registerTools = (server: McpServer) => {
  const tools = [];
  const { paths } = swaggerDocument;

  Object.keys(paths)
    .map((i) => {
      const { get } = paths[i];
      if (!get) return {};
      if (!("summary" in get)) return {}

      return {
        i,
        name: i.replace(/\//g, "_").replace("_", ""),
        description: get.summary,
        args: {
          url: z.string().default(i),
          ...breakDownArgs(get?.parameters || null)
        },
      };
    })
    .filter((i) => "name" in i)
    .forEach(({ i, name, description, args }) => {
      console.log({ name, description, args });
      server.tool(name as string, description as string, args as any, apiCallToolHandler);
    });

  // Register Swagger-based resource
  server.resource("swagger", "swagger://api", () => ({
    contents: [
      {
        text: JSON.stringify(swaggerDocument),
        uri: "swagger://api",
        mimeType: "application/json",
      },
    ],
  }));
};

export default registerTools;
