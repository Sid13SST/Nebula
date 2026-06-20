import { PlannedAction, ActionType, VerificationResult } from '../types/action.js';
import { BrowserManager } from '../browser/browserManager.js';
import { logger } from '../logging/logger.js';
import * as fs from 'fs';

/**
 * VerificationEngine verifies the outcome and state changes of executed browser actions.
 */
export class VerificationEngine {
  /**
   * Verifies if the specified action succeeded and returns a VerificationResult.
   */
  public async verifyAction(action: PlannedAction): Promise<VerificationResult> {
    logger.info(`Verification started for action: ${action.action}`);
    const page = BrowserManager.getInstance().getPage();

    try {
      switch (action.action) {
        case ActionType.NAVIGATE: {
          const currentUrl = page.url();
          const expectedUrl = action.value || '';
          
          // Basic substring or protocol validation
          const isUrlVerified = currentUrl.toLowerCase().includes(expectedUrl.replace(/https?:\/\/(www\.)?/, '').toLowerCase());
          return {
            verified: isUrlVerified,
            message: isUrlVerified
              ? `Navigation verified. Current URL matches target URL pattern: ${currentUrl}`
              : `Navigation verification failed. Expected URL containing "${expectedUrl}" but current URL is "${currentUrl}"`,
            actualState: { url: currentUrl },
          };
        }

        case ActionType.SEND_KEYS: {
          if (!action.selector) {
            return { verified: false, message: 'Verification failed: selector is missing' };
          }
          const locator = page.locator(action.selector);
          const val = await locator.inputValue({ timeout: 2000 });
          const matches = val === action.value;
          return {
            verified: matches,
            message: matches
              ? `Input field value verified successfully: "${val}"`
              : `Input field value verification failed. Expected "${action.value}" but found "${val}"`,
            actualState: { value: val },
          };
        }

        case ActionType.CLICK:
        case ActionType.DOUBLE_CLICK: {
          // If selector was clicked, make sure it exists, is visible and enabled
          if (action.selector) {
            const locator = page.locator(action.selector);
            const count = await locator.count();
            if (count === 0) {
              return {
                verified: false,
                message: `Click verification failed: Selector "${action.selector}" is no longer in the DOM`,
              };
            }
          }
          // Coordinate click check: assumes no crash occurred
          return {
            verified: true,
            message: `Click action completed without errors. Target selector: "${action.selector || 'coordinates'}"`,
          };
        }

        case ActionType.SCROLL: {
          // Query current scroll position in viewport
          const scrollPos = await page.evaluate(() => ({
            x: window.scrollX,
            y: window.scrollY,
          }));
          return {
            verified: true,
            message: `Scroll action executed. Viewport position: Y=${scrollPos.y}, X=${scrollPos.x}`,
            actualState: scrollPos,
          };
        }

        case ActionType.SCREENSHOT: {
          const filePath = action.value || '';
          const exists = fs.existsSync(filePath);
          return {
            verified: exists,
            message: exists
              ? `Screenshot file verified at ${filePath}`
              : `Screenshot file verification failed. File does not exist at ${filePath}`,
          };
        }

        case ActionType.OPEN_BROWSER:
          return {
            verified: !!page,
            message: 'Browser launch verified. Page instance is active.',
          };

        default:
          return {
            verified: true,
            message: `Action ${action.action} verified by default.`,
          };
      }
    } catch (error: any) {
      logger.error(`Verification failed for action ${action.action} with error: ${error.message}`);
      return {
        verified: false,
        message: `Action verification encountered an error: ${error.message}`,
      };
    }
  }
}

export default VerificationEngine;
