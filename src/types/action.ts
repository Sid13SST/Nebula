/**
 * Types of browser automation actions Nebula can perform.
 */
export enum ActionType {
  OPEN_BROWSER = 'OPEN_BROWSER',
  NAVIGATE = 'NAVIGATE',
  CLICK = 'CLICK',
  SEND_KEYS = 'SEND_KEYS',
  SCROLL = 'SCROLL',
  SCREENSHOT = 'SCREENSHOT',
  DOUBLE_CLICK = 'DOUBLE_CLICK',
}

/**
 * Represents a discrete browser automation action step.
 */
export interface Action {
  type: ActionType;
  payload: Record<string, any>;
  timestamp: Date;
  description?: string;
}
