/**
 * Represents the standard output format for all browser automation tools.
 */
export interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
}
