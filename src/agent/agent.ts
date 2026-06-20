import { Planner } from './planner.js';
import { Executor } from './executor.js';
import { PageObserver } from '../observation/pageObserver.js';
import { takeScreenshot } from '../tools/takeScreenshot.js';
import { ExecutionResult } from '../types/action.js';
import { AgentError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import * as path from 'path';

/**
 * AutomationAgent coordinates the core agentic loop: Observe -> Plan -> Execute -> Verify -> Recover -> Re-plan.
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
   * Incorporates self-healing verification, selector recovery, and AI re-planning.
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
      let result = await this.executor.executePlan(plan);

      // 4. Re-planning fallback: If execution failed, attempt re-planning once
      if (!result.success) {
        logger.warn('Initial execution plan failed. Triggering re-planning...');
        try {
          const errorMsg = result.errors.join(', ');
          const recoveryManager = (this.executor as any).recoveryManager;
          
          // Request new action plan using failure context
          const newPlan = await recoveryManager.requestReplan(goal, errorMsg);
          
          if (newPlan && newPlan.actions.length > 0) {
            logger.info('Executing newly generated replan...');
            const newResult = await this.executor.executePlan(newPlan);
            
            // Combine action outcomes and histories
            result = {
              success: newResult.success,
              completedActions: [...result.completedActions, ...newResult.completedActions],
              failedActions: newResult.success ? [] : newResult.failedActions,
              duration: result.duration + newResult.duration,
              errors: newResult.success ? [] : [...result.errors, ...newResult.errors],
              actionHistory: [...result.actionHistory, ...newResult.actionHistory],
              recoveryReport: {
                totalRecoveries: (result.recoveryReport?.totalRecoveries || 0) + (newResult.recoveryReport?.totalRecoveries || 0),
                successfulRecoveries: (result.recoveryReport?.successfulRecoveries || 0) + (newResult.recoveryReport?.successfulRecoveries || 0),
                failedRecoveries: (result.recoveryReport?.failedRecoveries || 0) + (newResult.recoveryReport?.failedRecoveries || 0),
                replansTriggered: (result.recoveryReport?.replansTriggered || 0) + 1,
              },
            };
          }
        } catch (replanError: any) {
          logger.error(`Re-planning workflow failed: ${replanError.message}`);
          result.errors.push(`Re-planning failed: ${replanError.message}`);
        }
      }

      // Capture screenshot on success or failure of final execution state
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
