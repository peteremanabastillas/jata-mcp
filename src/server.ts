import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

import { TRANSPORT, DNS, PORT } from "./config/env.js";
import { registerTools } from "./tools/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

export const SERVER_NAME = packageJson.name;
export const SERVER_VERSION = packageJson.version;

export async function main(): Promise<void> {
  try {
    // Resolve DSN from command line args, environment variables, or .env files

    // Create MCP server
    const server = new McpServer({
      name: SERVER_NAME,
      version: SERVER_VERSION,
    });

    // Register resources, tools, and prompts
    await registerTools(server);

    // Resolve transport type
    console.error(`Using transport: TRANSPORT`);

    // Set up transport based on type
    if (TRANSPORT === "sse") {
      // Set up Express server for SSE transport
      const app = express();
      let transport: SSEServerTransport;

      app.get("/sse", async (req, res) => {
        transport = new SSEServerTransport("/message", res);
        console.error("Client connected", transport?.["_sessionId"]);
        await server.connect(transport);

        // Listen for connection close
        res.on("close", () => {
          console.error("Client Disconnected", transport?.["_sessionId"]);
        });
      });

      app.post("/message", async (req, res) => {
        console.error("Client Message", transport?.["_sessionId"]);
        await transport.handlePostMessage(req, res, req.body);
      });

      // Start the HTTP server (port is only relevant for SSE transport)

      console.error(`Port source: ${PORT}`);
      app.listen(PORT, () => {
        console.error(`DBHub server listening at http://localhost:${PORT}`);
        console.error(`Connect to MCP server at http://localhost:${PORT}/sse`);
      });
    } else {
      throw new Error("Only support SSE tranasport mode.");
    }
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}
