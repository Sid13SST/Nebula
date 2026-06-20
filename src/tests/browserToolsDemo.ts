import { openBrowser } from '../tools/openBrowser.js';
import { navigateToUrl } from '../tools/navigateToUrl.js';
import { takeScreenshot } from '../tools/takeScreenshot.js';
import { scroll } from '../tools/scroll.js';
import { BrowserManager } from '../browser/browserManager.js';
import { logger } from '../logging/logger.js';

async function runDemo() {
  logger.info('--- Starting Browser Tools Demo ---');
  try {
    // 1. Open Browser
    const openRes = await openBrowser();
    logger.info(`Open Browser result: ${JSON.stringify(openRes)}`);

    // 2. Navigate to https://example.com
    const navRes = await navigateToUrl('https://example.com');
    logger.info(`Navigate result: ${JSON.stringify(navRes)}`);

    // 3. Take Screenshot
    const screenshotRes = await takeScreenshot();
    logger.info(`Screenshot result: ${JSON.stringify(screenshotRes)}`);

    // 4. Scroll Down by 200 pixels
    const scrollRes = await scroll(200);
    logger.info(`Scroll result: ${JSON.stringify(scrollRes)}`);

    // 5. Close Browser
    await BrowserManager.getInstance().close();
    logger.info('--- Browser Tools Demo Completed Successfully ---');
  } catch (error) {
    logger.error('Error during Browser Tools Demo:', error);
    process.exit(1);
  }
}

runDemo();
