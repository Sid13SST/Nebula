import { Executor } from '../agent/executor.js';
import { BrowserManager } from '../browser/browserManager.js';
import { openBrowser } from '../tools/openBrowser.js';
import { navigateToUrl } from '../tools/navigateToUrl.js';
import { ActionPlan, ActionType } from '../types/action.js';
import { logger } from '../logging/logger.js';

async function runRecoveryDemo() {
  logger.info('--- Starting Self-Healing & Recovery Demo ---');

  try {
    // 1. Initialize browser session and navigate to Shadcn forms
    await openBrowser();
    const targetUrl = 'https://ui.shadcn.com/docs/forms/react-hook-form';
    await navigateToUrl(targetUrl);

    // 2. Initialize Executor
    const executor = new Executor();

    // 3. Define ActionPlan with an INTENTIONALLY wrong selector
    // Selector '#wrong-title-selector' will fail initially, but the keyword 'title'
    // matches the label 'Bug Title' of element '#form-rhf-demo-title'.
    const simulatedPlan: ActionPlan = {
      reasoning: 'Testing self-healing recovery by inputting text using an invalid selector.',
      actions: [
        {
          action: ActionType.SEND_KEYS,
          selector: '#wrong-title-selector', // Intentionally incorrect!
          value: 'Recovery sandbox test success',
        },
      ],
    };

    // 4. Run plan execution through the Executor
    logger.info('Executing simulated plan with invalid selector...');
    const result = await executor.executePlan(simulatedPlan);

    console.log('--- RECOVERY EXECUTION REPORT ---');
    console.log(JSON.stringify(result, null, 2));

    // 5. Cleanup
    await BrowserManager.getInstance().close();
    logger.info('--- Recovery Demo Completed Successfully ---');
  } catch (error) {
    logger.error('Error during Recovery Demo:', error);
    try {
      await BrowserManager.getInstance().close();
    } catch {}
    process.exit(1);
  }
}

runRecoveryDemo();
