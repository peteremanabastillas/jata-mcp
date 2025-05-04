

// Import main function from server.ts
import { main } from "./server.js";

/**
 * Entry point for the DBHub MCP Server
 * Handles top-level exceptions and starts the server
 */
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
