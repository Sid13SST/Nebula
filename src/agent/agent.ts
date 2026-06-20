import { Planner } from './planner.js';
import { Executor } from './executor.js';
import { PageObserver } from '../observation/pageObserver.js';
import { takeScreenshot } from '../tools/takeScreenshot.js';
import { ExecutionResult } from '../types/action.js';
import { AgentError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import { BrowserManager } from '../browser/browserManager.js';
import * as path from 'path';

/**
 * AutomationAgent coordinates the core agentic loop: Observe -> Plan -> Execute.
 */
export class AutomationAgent {
  private planner: Planner;
  private executor: Executor;
  private observer: PageObserver;

  constructor() {
    this.planner = new Planner();
    this.executor = new Executor();
    this.observer = new PageObserver();
  }

  /**
   * Runs the agentic loop (Observe -> Plan -> Execute) to accomplish a given goal.
   * Automatically captures screenshot on completion or failure.
   */
  public async run(goal: string): Promise<ExecutionResult> {
    logger.info(`Starting agent orchestration for goal: "${goal}"`);
    const startTime = Date.now();

    try {
      // 1. Observe page state
      logger.info('Step 1: Observing page state...');
      const observation = await this.observer.observe();

      // 2. Generate action plan from Gemini client
      logger.info('Step 2: Generating action plan from Gemini client...');
      const plan = await this.planner.plan(goal, observation);

      // 3. Execute plan
      logger.info('Step 3: Dispatching plan execution...');
      const result = await this.executor.executePlan(plan);

      // Capture screenshot on success or failure of execution
      const pad = (num: number) => String(num).padStart(2, '0');
      const now = new Date();
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
        now.getHours()
      )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      
      const screenshotDir = path.join(process.cwd(), 'screenshots');

      if (result.success) {
        logger.info('Execution completed successfully. Taking completion screenshot...');
        const screenshotPath = path.join(screenshotDir, `completion_${timestampStr}.png`);
        try {
          await takeScreenshot(screenshotPath);
        } catch (err: any) {
          logger.warn(`Failed to capture completion screenshot: ${err.message}`);
        }
      } else {
        logger.error('Execution failed. Taking failure screenshot...');
        const screenshotPath = path.join(screenshotDir, `failure_${timestampStr}.png`);
        try {
          await takeScreenshot(screenshotPath);
        } catch (err: any) {
          logger.warn(`Failed to capture failure screenshot: ${err.message}`);
        }
      }

      const totalDuration = Date.now() - startTime;
      
      return {
        ...result,
        duration: totalDuration,
      };
    } catch (error: any) {
      logger.error(`Orchestrator run loop failed: ${error.message}`);
      
      // Auto capture failure screenshot on crash
      const pad = (num: number) => String(num).padStart(2, '0');
      const now = new Date();
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
        now.getHours()
      )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      
      const screenshotPath = path.join(process.cwd(), 'screenshots', `crash_${timestampStr}.png`);
      try {
        await takeScreenshot(screenshotPath);
      } catch (err: any) {
        logger.warn(`Failed to capture crash screenshot: ${err.message}`);
      }

      throw new AgentError(`Orchestration run failed: ${error.message}`);
    }
  }
}

export default AutomationAgent;
