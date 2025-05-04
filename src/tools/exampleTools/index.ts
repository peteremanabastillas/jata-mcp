import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolSuccessResponse } from "../../utils/response-formatter.js";

async function apiCallToolHandler(_args: {}, _extra: any) {
  // Prepare response data
  const responseData = {
    foo: "bar",
  };

  // Use the utility to create a standardized response
  return createToolSuccessResponse(responseData);
}
export const params = {
  name: "api_call",
  description: "Use this for API calls.",
  args: {},
  handler: apiCallToolHandler,
};

const registerTools = (server: McpServer) => {
  server.tool(
    "example_tool",
    "this is an example on how to properly implement a tool",
    {},
    apiCallToolHandler
  );
  // register promts
  server.prompt("example_tool", "Generate random tools for examples.", {}, () => ({
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "string",
        },
      },
    ],
  }));
  // register resources.
  // server.resource("schemas", "db://schemas", () => {});
};

export default registerTools;
