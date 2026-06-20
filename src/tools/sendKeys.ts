import { BrowserManager } from '../browser/browserManager.js';
import { ToolResult } from '../types/toolResult.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * Tool to send keystrokes/text input to a targeted element on the page.
 * @param selector CSS selector of the input field
 * @param text The keys/text to send
 */
export async function sendKeys(selector: string, text: string): Promise<ToolResult> {
  try {
    logger.info(`Tool: Sending keys to selector "${selector}"`);
    const page = BrowserManager.getInstance().getPage();
    const locator = page.locator(selector);

    // Wait for selector
    await locator.waitFor({ state: 'visible', timeout: 10000 });

    // Clear existing content
    await locator.clear();

    // Fill text
    await locator.fill(text);

    // Verify text entered
    const enteredValue = await locator.inputValue();
    if (enteredValue !== text) {
      throw new Error(`Verification failed: Expected value to be "${text}" but got "${enteredValue}"`);
    }

    logger.info(`Typed into selector: "${selector}" -> "${text}"`);
    return {
      success: true,
      message: `Successfully typed into selector "${selector}" and verified the content`,
    };
  } catch (error: any) {
    logger.error(`Tool sendKeys failed on selector "${selector}": ${error.message}`);
    throw new BrowserError(`Failed to send keys to selector "${selector}": ${error.message}`);
  }
}
