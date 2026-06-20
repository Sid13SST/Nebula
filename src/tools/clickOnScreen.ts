import { BrowserManager } from '../browser/browserManager.js';
import { ToolResult } from '../types/toolResult.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * Tool to click on specific coordinates on the screen.
 * @param x Horizontal coordinate
 * @param y Vertical coordinate
 */
export async function clickOnScreen(x: number, y: number): Promise<ToolResult> {
  try {
    logger.info(`Tool: Clicking at coordinates (${x}, ${y})`);
    const page = BrowserManager.getInstance().getPage();
    
    await page.mouse.click(x, y);
    logger.info(`Clicked at coordinates: (${x}, ${y})`);
    
    return {
      success: true,
      message: `Clicked at coordinates: (${x}, ${y}) successfully`,
    };
  } catch (error: any) {
    logger.error(`Tool clickOnScreen failed at (${x}, ${y}): ${error.message}`);
    throw new BrowserError(`Failed to click on screen at (${x}, ${y}): ${error.message}`);
  }
}
