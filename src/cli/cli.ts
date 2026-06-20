import * as readline from 'readline';
import { printBanner } from './banner.js';
import { openBrowser } from '../tools/openBrowser.js';
import { navigateToUrl } from '../tools/navigateToUrl.js';
import { AutomationAgent } from '../agent/agent.js';
import { BrowserManager } from '../browser/browserManager.js';
import { logger } from '../logging/logger.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function runCli() {
  printBanner();
  
  console.log('--- CLI INTERFACE STARTED ---');
  try {
    const urlInput = await askQuestion('Enter Target URL (e.g., https://example.com): ');
    let url = urlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const goal = await askQuestion('Enter Agent Goal (e.g., Click the header): ');
    
    rl.close();

    console.log('\n[Nebula] Initializing browser...');
    await openBrowser();
    
    console.log(`[Nebula] Navigating to URL: ${url}...`);
    await navigateToUrl(url);

    console.log('[Nebula] Starting agent loop (Observe -> Plan -> Execute)...');
    const agent = new AutomationAgent();
    
    const startTime = Date.now();
    const result = await agent.run(goal);
    const duration = Date.now() - startTime;

    console.log('\n===================================================');
    console.log('                 EXECUTION SUMMARY                 ');
    console.log('===================================================');
    console.log(`Goal:             ${goal}`);
    console.log(`Success:          ${result.success ? 'YES (SUCCESS)' : 'NO (FAILED)'}`);
    console.log(`Total Duration:   ${(duration / 1000).toFixed(2)}s`);
    console.log(`Actions Completed: ${result.completedActions.length}`);
    console.log(`Actions Failed:    ${result.failedActions.length}`);
    if (result.errors.length > 0) {
      console.log(`Errors:           ${result.errors.join(', ')}`);
    }

    console.log('\n===================================================');
    console.log('                 EXECUTION TIMELINE                ');
    console.log('===================================================');
    result.actionHistory.forEach((entry, idx) => {
      const timeStr = new Date(entry.timestamp).toLocaleTimeString();
      const statusIcon = entry.status === 'success' ? '✔ SUCCESS' : (entry.status === 'recovered' ? '⚙ RECOVERED' : '✖ FAILED');
      console.log(`${idx + 1}. [${timeStr}] ${entry.action.action} on "${entry.action.selector || 'coordinates'}" -> [${statusIcon}]`);
      if (entry.verificationResult) {
        console.log(`   Verification: ${entry.verificationResult.message}`);
      }
      if (entry.recoveryAttempts > 0) {
        console.log(`   Recovery attempts: ${entry.recoveryAttempts} (Retries: ${entry.retryCount})`);
      }
    });
    console.log('===================================================\n');

    // Close browser
    await BrowserManager.getInstance().close();
    console.log('[Nebula] Browser session closed. Goodbye!');
    process.exit(0);
  } catch (error: any) {
    console.error(`[Nebula] Critical error: ${error.message}`);
    try {
      await BrowserManager.getInstance().close();
    } catch {}
    process.exit(1);
  }
}

// Only run CLI if executed directly
if (process.argv[1]?.includes('cli.ts') || process.argv[1]?.includes('cli.js')) {
  runCli();
}

export { runCli };
export default runCli;
