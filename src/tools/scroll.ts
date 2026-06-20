import { BrowserManager } from '../browser/browserManager.js';
import { ToolResult } from '../types/toolResult.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * Tool to scroll the page by a given number of pixels vertically.
 * @param pixels The number of pixels to scroll (positive for down, negative for up)
 */
export async function scroll(pixels: number): Promise<ToolResult> {
  try {
    logger.info(`Tool: Scrolling page by ${pixels} pixels`);
    const page = BrowserManager.getInstance().getPage();
    
    await page.mouse.wheel(0, pixels);
    logger.info(`Scrolled page by ${pixels} pixels`);

    return {
      success: true,
      message: `Scrolled page by ${pixels} pixels successfully`,
    };
  } catch (error: any) {
    logger.error(`Tool scroll failed: ${error.message}`);
    throw new BrowserError(`Failed to scroll page by ${pixels} pixels: ${error.message}`);
  }
}
