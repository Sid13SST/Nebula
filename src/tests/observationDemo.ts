import { openBrowser } from '../tools/openBrowser.js';
import { navigateToUrl } from '../tools/navigateToUrl.js';
import { PageObserver } from '../observation/pageObserver.js';
import { BrowserManager } from '../browser/browserManager.js';
import { logger } from '../logging/logger.js';

async function runObservationDemo() {
  logger.info('--- Starting Observation Demo ---');
  try {
    // 1. Open Browser
    await openBrowser();

    // 2. Navigate to targeted form page
    const targetUrl = 'https://ui.shadcn.com/docs/forms/react-hook-form';
    await navigateToUrl(targetUrl);

    // 3. Observe the Page
    const observer = new PageObserver();
    const observation = await observer.observe();

    // 4. Print structured JSON output (only show first few elements for readability)
    const displayCopy = {
      title: observation.title,
      url: observation.url,
      elements: observation.elements.slice(0, 15).map((el) => ({
        type: el.type,
        label: el.label,
        selector: el.selector,
        isVisible: el.isVisible,
      })),
    };
    
    console.log('--- STRUCTURED JSON OBSERVATION (First 15 elements) ---');
    console.log(JSON.stringify(displayCopy, null, 2));

    // 5. Close Browser
    await BrowserManager.getInstance().close();
    logger.info('--- Observation Demo Completed Successfully ---');
  } catch (error) {
    logger.error('Error during Observation Demo:', error);
    try {
      await BrowserManager.getInstance().close();
    } catch {}
    process.exit(1);
  }
}

runObservationDemo();
