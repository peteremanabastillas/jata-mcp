/**
 * Response formatter utility for consistent API responses
 * Provides formatting for resources, tools, and prompts
 */

/**
 * Create a success response with the given data
 */
export function formatSuccessResponse<T>(
  data: T,
  meta: Record<string, any> = {}
): {
  success: true;
  data: T;
  meta?: Record<string, any>;
} {
  return {
    success: true,
    data,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  };
}

/**
 * Create an error response with the given message and code
 */
export function formatErrorResponse(
  error: string,
  code: string = "ERROR",
  details?: any
): {
  success: false;
  error: string;
  code: string;
  details?: any;
} {
  return {
    success: false,
    error,
    code,
    ...(details ? { details } : {}),
  };
}

/**
 * Create a tool error response object
 */
export function createToolErrorResponse(error: string, code: string = "ERROR", details?: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(formatErrorResponse(error, code, details), null, 2),
        mimeType: "application/json",
      },
    ],
    isError: true,
  };
}

/**
 * Create a tool success response object
 */
export function createToolSuccessResponse<T>(data: T, meta: Record<string, any> = {}) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(formatSuccessResponse(data, meta), null, 2),
        mimeType: "application/json",
      },
    ],
  };
}

/**
 * Create a resource error response object
 */
export function createResourceErrorResponse(
  uri: string,
  error: string,
  code: string = "ERROR",
  details?: any
) {
  return {
    contents: [
      {
        uri,
        text: JSON.stringify(formatErrorResponse(error, code, details), null, 2),
        mimeType: "application/json",
      },
    ],
  };
}

/**
 * Create a resource success response object
 */
export function createResourceSuccessResponse<T>(
  uri: string,
  data: T,
  meta: Record<string, any> = {}
) {
  return {
    contents: [
      {
        uri,
        text: JSON.stringify(formatSuccessResponse(data, meta), null, 2),
        mimeType: "application/json",
      },
    ],
  };
}

/**
 * Format a successful prompt response in the MCP format
 */
export function formatPromptSuccessResponse(
  text: string,
  references: string[] = []
): {
  messages: Array<{
    role: "assistant";
    content: {
      type: "text";
      text: string;
    };
  }>;
  references?: string[];
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
} {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text,
        },
      },
    ],
    ...(references.length > 0 ? { references } : {}),
  };
}

/**
 * Format an error prompt response in the MCP format
 */
export function formatPromptErrorResponse(
  error: string,
  code: string = "ERROR"
): {
  messages: Array<{
    role: "assistant";
    content: {
      type: "text";
      text: string;
    };
  }>;
  error: string;
  code: string;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
} {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: `Error: ${error}`,
        },
      },
    ],
    error,
    code,
  };
}
