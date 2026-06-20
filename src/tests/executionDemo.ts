import { AutomationAgent } from '../agent/agent.js';
import { BrowserManager } from '../browser/browserManager.js';
import { GeminiClient } from '../llm/geminiClient.js';
import { openBrowser } from '../tools/openBrowser.js';
import { navigateToUrl } from '../tools/navigateToUrl.js';
import { logger } from '../logging/logger.js';

async function runExecutionDemo() {
  logger.info('--- Starting Execution Demo ---');

  try {
    // 1. Initialize browser session
    await openBrowser();
    await navigateToUrl('https://example.com');

    // 2. Instantiate agent
    const agent = new AutomationAgent();

    // 3. Stub GeminiClient if dummy key detected to run test suite deterministically
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey.startsWith('dummy') || !apiKey) {
      logger.warn('Dummy API Key detected. Stubbing Planner GeminiClient for test execution.');
      // Extract the planner's geminiClient to stub it
      const planner = (agent as any).planner;
      const client = (planner as any).geminiClient;
      client.generateStructuredResponse = async () => {
        logger.info('[STUB] Returning simulated action plan for example.com.');
        return JSON.stringify({
          reasoning: 'I will click on the header and scroll the page to test the execution engine.',
          actions: [
            {
              action: 'CLICK',
              selector: 'h1',
            },
            {
              action: 'SCROLL',
              value: '150',
            },
            {
              action: 'SCREENSHOT',
              value: './screenshots/demo_execution_step.png',
            },
          ],
        });
      };
    }

    // 4. Run end-to-end agent
    const goal = 'Click the header, scroll down, and take a screenshot';
    const report = await agent.run(goal);

    console.log('--- AGENT EXECUTION REPORT ---');
    console.log(JSON.stringify(report, null, 2));

    // 5. Cleanup
    await BrowserManager.getInstance().close();
    logger.info('--- Execution Demo Completed Successfully ---');
  } catch (error) {
    logger.error('Error during Execution Demo:', error);
    try {
      await BrowserManager.getInstance().close();
    } catch {}
    process.exit(1);
  }
}

runExecutionDemo();
