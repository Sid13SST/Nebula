import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { env } from '../config/env.js';
import { logger } from '../logging/logger.js';
import { BrowserError } from '../errors/AppError.js';

/**
 * Singleton BrowserManager responsible for launching and managing the Playwright browser session.
 */
export class BrowserManager {
  private static instance: BrowserManager | null = null;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isInitializing: boolean = false;

  private constructor() {
    // Singleton constructor
  }

  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /**
   * Initializes the browser instance.
   * Launch Chromium, create context, and create page.
   */
  public async initialize(): Promise<void> {
    if (this.browser) {
      logger.debug('Browser is already initialized.');
      return;
    }

    if (this.isInitializing) {
      logger.debug('Browser initialization is already in progress.');
      return;
    }

    this.isInitializing = true;
    try {
      logger.info('Initializing Playwright browser (Chromium)...');
      
      this.browser = await chromium.launch({
        headless: env.HEADLESS,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });

      this.page = await this.context.newPage();
      
      logger.info('Playwright browser initialized successfully.');
    } catch (error: any) {
      logger.error(`Failed to initialize BrowserManager: ${error.message}`);
      await this.close();
      throw new BrowserError(`Browser initialization failed: ${error.message}`);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Closes the active browser session, context, and page.
   */
  public async close(): Promise<void> {
    logger.info('Closing BrowserManager session...');
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info('BrowserManager session closed successfully.');
    } catch (error: any) {
      logger.error(`Error while closing BrowserManager: ${error.message}`);
      throw new BrowserError(`Failed to close browser: ${error.message}`);
    }
  }

  /**
   * Returns the current Browser instance.
   */
  public getBrowser(): Browser {
    if (!this.browser) {
      throw new BrowserError('Browser is not initialized. Call initialize() first.');
    }
    return this.browser;
  }

  /**
   * Returns the current BrowserContext instance.
   */
  public getContext(): BrowserContext {
    if (!this.context) {
      throw new BrowserError('Browser context is not initialized. Call initialize() first.');
    }
    return this.context;
  }

  /**
   * Returns the current active Page instance.
   */
  public getPage(): Page {
    if (!this.page) {
      throw new BrowserError('Page is not initialized. Call initialize() first.');
    }
    return this.page;
  }
}

export default BrowserManager;
