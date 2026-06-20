import { Browser, BrowserContext, Page } from 'playwright';

/**
 * Singleton BrowserManager responsible for launching and managing the Playwright browser session.
 */
export class BrowserManager {
  private static instance: BrowserManager | null = null;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

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
   * TODO: Implement browser launching via Playwright using configured environment variables (e.g., HEADLESS).
   */
  public async initialize(): Promise<void> {
    // TODO: Launch playwright browser, configure context and default page
    // Example:
    // this.browser = await chromium.launch({ headless: env.HEADLESS });
    // this.context = await this.browser.newContext();
    // this.page = await this.context.newPage();
  }

  /**
   * Closes the browser instance and cleans up sessions.
   * TODO: Close playwright context and browser.
   */
  public async close(): Promise<void> {
    // TODO: Perform cleanup, close page, context and browser
  }

  /**
   * Returns the current Browser instance.
   * TODO: Validate browser is initialized before returning.
   */
  public getBrowser(): Browser {
    if (!this.browser) {
      // TODO: Throw Custom BrowserError or auto-initialize
    }
    return this.browser as Browser;
  }

  /**
   * Returns the current active Page instance.
   * TODO: Validate page is active.
   */
  public getPage(): Page {
    if (!this.page) {
      // TODO: Throw Custom BrowserError or auto-initialize
    }
    return this.page as Page;
  }
}

export default BrowserManager;
