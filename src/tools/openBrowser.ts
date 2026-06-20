import { BrowserManager } from '../browser/browserManager.js';
import { ToolResult } from '../types/toolResult.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * Tool to initialize and open a new browser instance.
 * @param config Configuration options for the browser (e.g., headless mode)
 */
export async function openBrowser(config?: { headless?: boolean }): Promise<ToolResult> {
  try {
    logger.info('Tool: Opening browser...');
    const manager = BrowserManager.getInstance();
    await manager.initialize();
    
    logger.info('Browser opened');
    return {
      success: true,
      message: 'Browser opened successfully',
    };
  } catch (error: any) {
    logger.error(`Tool openBrowser failed: ${error.message}`);
    throw new BrowserError(`Failed to open browser: ${error.message}`);
  }
}
