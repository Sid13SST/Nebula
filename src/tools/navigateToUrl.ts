import { PageManager } from '../browser/pageManager.js';
import { ToolResult } from '../types/toolResult.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * Tool to navigate the active browser tab to a specified URL.
 * @param url The destination URL
 */
export async function navigateToUrl(url: string): Promise<ToolResult> {
  try {
    logger.info(`Tool: Navigating to URL: ${url}`);
    const pageManager = new PageManager();
    await pageManager.navigate(url);
    await pageManager.waitForLoad();
    
    logger.info(`Navigated to URL: ${url}`);
    return {
      success: true,
      message: `Navigated to URL: ${url} successfully`,
      data: { url: pageManager.getCurrentUrl() },
    };
  } catch (error: any) {
    logger.error(`Tool navigateToUrl failed: ${error.message}`);
    throw new BrowserError(`Failed to navigate to URL ${url}: ${error.message}`);
  }
}
