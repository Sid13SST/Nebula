import { ActionPlan, ActionType, ExecutionResult, PlannedAction } from '../types/action.js';
import { BrowserError, AgentError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import { BrowserManager } from '../browser/browserManager.js';

// Import tool implementations
import { openBrowser } from '../tools/openBrowser.js';
import { navigateToUrl } from '../tools/navigateToUrl.js';
import { clickOnScreen } from '../tools/clickOnScreen.js';
import { doubleClick } from '../tools/doubleClick.js';
import { sendKeys } from '../tools/sendKeys.js';
import { scroll } from '../tools/scroll.js';
import { takeScreenshot } from '../tools/takeScreenshot.js';

/**
 * Executor is responsible for mapping abstract plans/actions to concrete browser tool calls.
 */
export class Executor {
  // Registry mapping ActionType to tools
  private registry: Record<string, (...args: any[]) => Promise<any>> = {
    [ActionType.OPEN_BROWSER]: openBrowser,
    [ActionType.NAVIGATE]: navigateToUrl,
    [ActionType.CLICK]: clickOnScreen,
    [ActionType.DOUBLE_CLICK]: doubleClick,
    [ActionType.SEND_KEYS]: sendKeys,
    [ActionType.SCROLL]: scroll,
    [ActionType.SCREENSHOT]: takeScreenshot,
  };

  /**
   * Validates target action structure before execution.
   */
  public validateAction(action: PlannedAction): void {
    if (!action.action) {
      throw new AgentError('Action type is missing');
    }

    if (!this.registry[action.action]) {
      throw new AgentError(`Unknown action type: ${action.action}`);
    }

    switch (action.action) {
      case ActionType.NAVIGATE:
        if (!action.value) {
          throw new AgentError('NAVIGATE action requires a URL value');
        }
        break;
      case ActionType.SEND_KEYS:
        if (!action.selector) {
          throw new AgentError('SEND_KEYS action requires a selector');
        }
        if (action.value === undefined) {
          throw new AgentError('SEND_KEYS action requires a value');
        }
        break;
      case ActionType.CLICK:
      case ActionType.DOUBLE_CLICK:
        if (!action.selector && !action.value) {
          throw new AgentError(`${action.action} action requires a selector or coordinate value ("x,y")`);
        }
        break;
      case ActionType.SCROLL:
        if (!action.value || isNaN(Number(action.value))) {
          throw new AgentError('SCROLL action requires a numeric value');
        }
        break;
    }
  }

  /**
   * Executes a single planned action.
   */
  public async executeAction(action: PlannedAction): Promise<void> {
    this.validateAction(action);
    logger.info(`Action started: ${action.action}`);

    const tool = this.registry[action.action];
    
    switch (action.action) {
      case ActionType.OPEN_BROWSER:
        await tool();
        break;
      case ActionType.NAVIGATE:
        await tool(action.value);
        break;
      case ActionType.CLICK:
      case ActionType.DOUBLE_CLICK: {
        let x = 0;
        let y = 0;
        
        if (action.value && action.value.includes(',')) {
          const parts = action.value.split(',');
          x = parseInt(parts[0], 10);
          y = parseInt(parts[1], 10);
        } else if (action.selector) {
          const page = BrowserManager.getInstance().getPage();
          const bbox = await page.locator(action.selector).boundingBox();
          if (!bbox) {
            throw new BrowserError(`Target selector "${action.selector}" not found on screen`);
          }
          x = bbox.x + bbox.width / 2;
          y = bbox.y + bbox.height / 2;
        }
        await tool(x, y);
        break;
      }
      case ActionType.SEND_KEYS:
        await tool(action.selector, action.value);
        break;
      case ActionType.SCROLL:
        await tool(Number(action.value));
        break;
      case ActionType.SCREENSHOT:
        await tool(action.value);
        break;
    }

    logger.info(`Action completed: ${action.action}`);
  }

  /**
   * Executes a single action, retrying up to 3 times with exponential backoff on failure.
   */
  public async retryAction(action: PlannedAction): Promise<void> {
    let retries = 0;
    const maxRetries = 3;
    let delay = 1000;

    while (retries < maxRetries) {
      try {
        if (retries > 0) {
          logger.info(`Retry started: ${action.action} (Attempt ${retries + 1}/${maxRetries})`);
        }
        await this.executeAction(action);
        if (retries > 0) {
          logger.info(`Retry completed: ${action.action} (Succeeded on attempt ${retries + 1})`);
        }
        return;
      } catch (error: any) {
        retries++;
        logger.warn(`Action ${action.action} failed: ${error.message}`);
        
        if (retries >= maxRetries) {
          logger.error(`Action ${action.action} failed after ${maxRetries} attempts.`);
          throw error;
        }

        logger.info(`Sleeping for ${delay}ms before next retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Orchestrates the execution of a complete ActionPlan.
   */
  public async executePlan(plan: ActionPlan): Promise<ExecutionResult> {
    const startTime = Date.now();
    const completedActions: PlannedAction[] = [];
    const failedActions: PlannedAction[] = [];
    const errors: string[] = [];
    const actionHistory: ExecutionResult['actionHistory'] = [];

    logger.info(`Executing ActionPlan containing ${plan.actions.length} actions.`);

    for (const action of plan.actions) {
      const historyEntry = {
        action,
        timestamp: new Date(),
        success: false,
        error: undefined as string | undefined,
      };

      try {
        await this.retryAction(action);
        historyEntry.success = true;
        completedActions.push(action);
      } catch (error: any) {
        historyEntry.error = error.message;
        errors.push(`${action.action} failed: ${error.message}`);
        failedActions.push(action);
        actionHistory.push(historyEntry);
        
        // Interrupt plan execution upon failure of any single action
        logger.error(`Plan execution interrupted due to action failure: ${action.action}`);
        break;
      }

      actionHistory.push(historyEntry);
    }

    const duration = Date.now() - startTime;
    const success = failedActions.length === 0 && errors.length === 0;
    
    logger.info(`Execution finished. Success: ${success}. Duration: ${duration}ms.`);

    return {
      success,
      completedActions,
      failedActions,
      duration,
      errors,
      actionHistory,
    };
  }
}

export default Executor;
