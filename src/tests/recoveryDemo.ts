import { AutomationAgent } from '../agent/agent.js';
import { BrowserManager } from '../browser/browserManager.js';
import { openBrowser } from '../tools/openBrowser.js';
import { navigateToUrl } from '../tools/navigateToUrl.js';
import { ActionType } from '../types/action.js';
import { logger } from '../logging/logger.js';

async function runRecoveryDemo() {
  logger.info('--- Starting Self-Healing & Recovery Demo ---');

  try {
    // 1. Initialize browser session and navigate to Shadcn forms
    await openBrowser();
    const targetUrl = 'https://ui.shadcn.com/docs/forms/react-hook-form';
    await navigateToUrl(targetUrl);

    // 2. Initialize Agent
    const agent = new AutomationAgent();

    // 3. Stub the GeminiClient inside Planner to return an incorrect selector
    // This triggers the SelectorRecovery engine under real agent execution loop.
    const planner = (agent as any).planner;
    const client = (planner as any).geminiClient;
    client.generateStructuredResponse = async () => {
      logger.info('[STUB] Returning simulated action plan for Shadcn forms.');
      return JSON.stringify({
        reasoning: 'Testing self-healing by inputting text using an invalid selector.',
        actions: [
          {
            action: ActionType.SEND_KEYS,
            selector: '#wrong-title-selector', // Intentionally incorrect!
            value: 'Recovery sandbox demo success',
          },
        ],
      });
    };

    // 4. Run plan execution through the Agent (which writes reports/report.json)
    logger.info('Executing simulated goal through Agent...');
    const goal = 'Input text into the Bug Title field';
    const result = await agent.run(goal);

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
