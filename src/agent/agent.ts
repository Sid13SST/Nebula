import { Planner } from './planner.js';
import { Executor } from './executor.js';
import { PageObserver } from '../observation/pageObserver.js';
import { takeScreenshot } from '../tools/takeScreenshot.js';
import { ExecutionResult } from '../types/action.js';
import { AgentError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import * as path from 'path';
import * as fs from 'fs';

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
   * Tracks execution metrics, saves sorted screenshots, and writes a final execution JSON report.
   */
  public async run(goal: string): Promise<ExecutionResult> {
    logger.info(`Starting agent orchestration for goal: "${goal}"`);
    const agentStartTime = Date.now();

    // Ensure organized screenshot directories exist
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    const beforeDir = path.join(screenshotsDir, 'before');
    const afterDir = path.join(screenshotsDir, 'after');
    const failuresDir = path.join(screenshotsDir, 'failures');

    [beforeDir, afterDir, failuresDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const pad = (num: number) => String(num).padStart(2, '0');
    const getTimestamp = () => {
      const now = new Date();
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
        now.getHours()
      )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    };

    let beforeScreenshot = '';
    let afterScreenshot = '';
    let failureScreenshot = '';

    // Initialize metrics
    let planningTime = 0;
    let observationTime = 0;
    let executionTime = 0;

    try {
      // 1. Observe page state
      logger.info('Step 1: Observing page state...');
      const obsStartTime = Date.now();
      const observation = await this.observer.observe();
      observationTime = Date.now() - obsStartTime;

      // Capture "before" screenshot
      const tsBefore = getTimestamp();
      beforeScreenshot = path.join(beforeDir, `before_${tsBefore}.png`);
      try {
        await takeScreenshot(beforeScreenshot);
        logger.info(`Captured "before" screenshot: ${beforeScreenshot}`);
      } catch (err: any) {
        logger.warn(`Failed to capture "before" screenshot: ${err.message}`);
      }

      // 2. Generate action plan from Gemini client
      logger.info('Step 2: Generating action plan from Gemini client...');
      const planStartTime = Date.now();
      const plan = await this.planner.plan(goal, observation);
      planningTime = Date.now() - planStartTime;

      // 3. Execute plan
      logger.info('Step 3: Dispatching plan execution...');
      const execStartTime = Date.now();
      let result = await this.executor.executePlan(plan);
      executionTime = Date.now() - execStartTime;

      // 4. Re-planning fallback: If execution failed, attempt re-planning once
      if (!result.success) {
        logger.warn('Initial execution plan failed. Triggering re-planning...');
        const replanStartTime = Date.now();
        try {
          const errorMsg = result.errors.join(', ');
          const recoveryManager = (this.executor as any).recoveryManager;
          
          const newPlan = await recoveryManager.requestReplan(goal, errorMsg);
          planningTime += (Date.now() - replanStartTime);
          
          if (newPlan && newPlan.actions.length > 0) {
            logger.info('Executing newly generated replan...');
            const newExecStartTime = Date.now();
            const newResult = await this.executor.executePlan(newPlan);
            executionTime += (Date.now() - newExecStartTime);
            
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

      // Capture final screenshot
      const tsFinal = getTimestamp();
      if (result.success) {
        afterScreenshot = path.join(afterDir, `after_${tsFinal}.png`);
        try {
          await takeScreenshot(afterScreenshot);
          logger.info(`Captured "after" screenshot: ${afterScreenshot}`);
        } catch (err: any) {
          logger.warn(`Failed to capture "after" screenshot: ${err.message}`);
        }
      } else {
        failureScreenshot = path.join(failuresDir, `failure_${tsFinal}.png`);
        try {
          await takeScreenshot(failureScreenshot);
          logger.info(`Captured "failure" screenshot: ${failureScreenshot}`);
        } catch (err: any) {
          logger.warn(`Failed to capture "failure" screenshot: ${err.message}`);
        }
      }

      const totalDuration = Date.now() - agentStartTime;

      // Prepare final report data
      const finalReport = {
        goal,
        url: observation.url,
        duration: totalDuration,
        success: result.success,
        actionsExecuted: result.completedActions.length + result.failedActions.length,
        recoveries: result.recoveryReport || { totalRecoveries: 0, successfulRecoveries: 0, failedRecoveries: 0, replansTriggered: 0 },
        errors: result.errors,
        screenshots: {
          before: beforeScreenshot,
          after: afterScreenshot || undefined,
          failure: failureScreenshot || undefined,
        },
        metrics: {
          planningTimeMs: planningTime,
          observationTimeMs: observationTime,
          executionTimeMs: executionTime,
          recoveryCount: result.recoveryReport?.totalRecoveries || 0,
          successRate: result.success ? 1.0 : 0.0,
        },
      };

      // Write report to reports/report.json
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(reportsDir, 'report.json'), JSON.stringify(finalReport, null, 2), 'utf-8');
      logger.info(`Execution report generated at: ${path.join(reportsDir, 'report.json')}`);

      return {
        ...result,
        duration: totalDuration,
      };
    } catch (error: any) {
      logger.error(`Orchestrator run loop failed: ${error.message}`);
      
      // Auto capture failure screenshot on crash
      const tsCrash = getTimestamp();
      failureScreenshot = path.join(failuresDir, `crash_${tsCrash}.png`);
      try {
        await takeScreenshot(failureScreenshot);
      } catch (err: any) {
        logger.warn(`Failed to capture crash screenshot: ${err.message}`);
      }

      throw new AgentError(`Orchestration run failed: ${error.message}`);
    }
  }
}

export default AutomationAgent;
