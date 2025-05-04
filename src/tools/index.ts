import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readdir } from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { stat } from "fs/promises";
import { pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function listDirRelativeToFile(filePath: string, server: McpServer) {
  const dirPath = path.dirname(filePath);
  console.log({ dirPath });

  readdir(dirPath, async (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }
    console.log({ files });
    console.log({ __dirname, __filename });

    for await (const file of files) {
      console.log(`${dirPath}/${file}`);
      const stats = await stat(`${dirPath}/${file}`);
      if (stats.isDirectory()) {
        const fileUrl = pathToFileURL(`${dirPath}/${file}/index.js`).href;

        import(fileUrl)
          .then((module) => {
            console.log(`${file} loaded`, module);
            // by calling the default you registered the tool
            module.default(server);
          })
          .catch((error) => {
            console.error(`Failed to load ${file}:`, error);
          });
      }
    }
  });
}

/**
 * Register all tool handlers with the MCP server
 */
export async function registerTools(server: McpServer): Promise<void> {
  const currentFilePath = __filename; // Use __filename to get the path of the current file
  console.log({ __filename });
  await listDirRelativeToFile(currentFilePath, server);
  // Tool to run a SQL query (read-only for safety)
}
