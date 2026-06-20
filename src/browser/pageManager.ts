import { Page } from 'playwright';
import { BrowserManager } from './browserManager.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * PageManager manages page level actions, DOM querying, navigation, state, and low-level interactions.
 */
export class PageManager {
  private getActivePage(): Page {
    return BrowserManager.getInstance().getPage();
  }

  /**
   * Navigates to the specified URL and waits for the page to load.
   */
  public async navigate(url: string): Promise<void> {
    const page = this.getActivePage();
    logger.info(`Navigating to URL: ${url}`);
    try {
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 30000,
      });
      logger.info(`Successfully navigated to: ${url}`);
    } catch (error: any) {
      logger.error(`Navigation failed for URL ${url}: ${error.message}`);
      throw new BrowserError(`Navigation to ${url} failed: ${error.message}`);
    }
  }

  /**
   * Returns the current page URL.
   */
  public getCurrentUrl(): string {
    try {
      return this.getActivePage().url();
    } catch (error: any) {
      throw new BrowserError(`Failed to get current URL: ${error.message}`);
    }
  }

  /**
   * Waits for the page to reach a loaded state.
   */
  public async waitForLoad(): Promise<void> {
    const page = this.getActivePage();
    try {
      await page.waitForLoadState('load', { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    } catch (error: any) {
      logger.warn(`Wait for load state timed out or failed: ${error.message}`);
      // Do not throw to allow partial loaded pages to proceed
    }
  }

  /**
   * Reloads the current page.
   */
  public async reload(): Promise<void> {
    const page = this.getActivePage();
    logger.info('Reloading page...');
    try {
      await page.reload({ waitUntil: 'load', timeout: 30000 });
      logger.info('Page reloaded successfully.');
    } catch (error: any) {
      logger.error(`Reload failed: ${error.message}`);
      throw new BrowserError(`Reload failed: ${error.message}`);
    }
  }

  /**
   * Returns the underlying Playwright Page instance.
   */
  public getPage(): Page {
    return this.getActivePage();
  }
}

export default PageManager;
