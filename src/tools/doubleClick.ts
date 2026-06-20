import { BrowserManager } from '../browser/browserManager.js';
import { ToolResult } from '../types/toolResult.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * Tool to double-click on specific coordinates on the screen.
 * @param x Horizontal coordinate
 * @param y Vertical coordinate
 */
export async function doubleClick(x: number, y: number): Promise<ToolResult> {
  try {
    logger.info(`Tool: Double-clicking at coordinates (${x}, ${y})`);
    const page = BrowserManager.getInstance().getPage();
    
    await page.mouse.dblclick(x, y);
    logger.info(`Double-clicked at coordinates: (${x}, ${y})`);
    
    return {
      success: true,
      message: `Double-clicked at coordinates: (${x}, ${y}) successfully`,
    };
  } catch (error: any) {
    logger.error(`Tool doubleClick failed at (${x}, ${y}): ${error.message}`);
    throw new BrowserError(`Failed to double-click at (${x}, ${y}): ${error.message}`);
  }
}
