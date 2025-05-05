import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolSuccessResponse } from "../../utils/response-formatter.js";
import { swaggerDocument } from "./swagger.js";


type SwaggerOperationInput = {
  path: string;
  method: string;
  operation: any;
};

function convertToMcpToolFromJson({ path, method, operation }: SwaggerOperationInput) {
  const toolName = operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`;

  const parameters = (operation.parameters || []).reduce((acc: any, param: any) => {
    acc[param.name] = {
      type: param.schema?.type || 'string',
      description: param.description || '',
    };
    return acc;
  }, {});

  const requiredParams = (operation.parameters || [])
    .filter((param: any) => param.required)
    .map((param: any) => param.name);
  const description = `Use as ${toolName.replace(/\//g, ' ').replaceAll('_', ' ')}`
  return {
    name: toolName,
    description: operation.summary || operation.description || description,
    parameters: {
      type: 'object',
      properties: parameters,
      required: requiredParams,
    },
    method,
    path,
    apiCallToolHandler
  };
}



async function apiCallToolHandler(_args: {}, _extra: any) {
  console.log({ _args, _extra })


  const responseData = {
    foo: "bar",
  };

  // Use the utility to create a standardized response
  return createToolSuccessResponse(responseData);
}
export const params = {
  name: "swaggert_api_call",
  description: "Use this for API calls.",
  args: {},
  handler: apiCallToolHandler,
};

const registerTools = (server: McpServer) => {


  const tools = [];

  for (const [path, methods] of Object.entries(swaggerDocument)) {
    for (const [method, operation] of Object.entries(methods)) {
      const tool = convertToMcpToolFromJson({ path, method, operation });
      tools.push(tool);
      console.log({ tool })
      server.tool(
        tool.name,
        tool.description,
        { ...tool.parameters, method: tool.method, },
        apiCallToolHandler
      );

    }
  }




  // register resources.
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

  // Register Swagger-based prompts for each endpoint
  Object.keys(swaggerDocument.paths).forEach((path) => {
    const methods = swaggerDocument.paths[path as keyof typeof swaggerDocument.paths];
    Object.keys(methods).forEach((method) => {
      const operation = methods[method as keyof typeof methods] as { description?: string };
      const promptName = `${method.toUpperCase()} ${path}`;
      const promptDescription = operation.description || `Handle ${method.toUpperCase()} requests for ${path}`;

      server.prompt(promptName, promptDescription, {}, () => ({
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `This is a ${method.toUpperCase()} request for ${path}`,
            },
          },
        ],
      }));
    });
  });
};

export default registerTools;
