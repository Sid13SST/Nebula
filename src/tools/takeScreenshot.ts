import { BrowserManager } from '../browser/browserManager.js';
import { ToolResult } from '../types/toolResult.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tool to capture a screenshot of the active page.
 * Saves screenshots inside screenshots/ using format YYYY-MM-DD_HH-mm-ss.png.
 * @returns The resolved absolute path to the saved screenshot file
 */
export async function takeScreenshot(customPath?: string): Promise<ToolResult> {
  try {
    logger.info('Tool: Capturing screenshot...');
    const page = BrowserManager.getInstance().getPage();

    // Create screenshots directory automatically
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Format date: YYYY-MM-DD_HH-mm-ss
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
      now.getHours()
    )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    
    const filename = `${timestampStr}.png`;
    const targetPath = customPath ? path.resolve(customPath) : path.join(screenshotsDir, filename);

    await page.screenshot({ path: targetPath });
    logger.info(`Screenshot saved: ${targetPath}`);

    return {
      success: true,
      message: `Screenshot saved successfully to ${targetPath}`,
      data: { path: targetPath },
    };
  } catch (error: any) {
    logger.error(`Tool takeScreenshot failed: ${error.message}`);
    throw new BrowserError(`Failed to take screenshot: ${error.message}`);
  }
}
