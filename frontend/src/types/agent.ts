export type ActionType = 'OPEN_BROWSER' | 'NAVIGATE' | 'CLICK' | 'SEND_KEYS' | 'SCROLL' | 'SCREENSHOT' | 'DOUBLE_CLICK';

export interface PlannedAction {
  action: ActionType;
  selector?: string;
  value?: string;
}

export interface ActionPlan {
  reasoning: string;
  actions: PlannedAction[];
}

export interface VerificationResult {
  verified: boolean;
  message: string;
}

export interface ActionHistoryEntry {
  timestamp: string;
  action: PlannedAction;
  status: 'success' | 'failed' | 'recovered';
  retryCount: number;
  verificationResult?: VerificationResult;
  recoveryAttempts: number;
  error?: string;
}

export interface RecoveryReport {
  totalRecoveries: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  replansTriggered: number;
}

export interface ElementInfo {
  id: string;
  type: string;
  label?: string;
  selector: string;
  placeholder?: string;
  isVisible: boolean;
}

export interface PageObservation {
  url: string;
  title: string;
  timestamp: string;
  elements: ElementInfo[];
}

export interface ExecutionReport {
  goal: string;
  url: string;
  duration: number;
  success: boolean;
  actionsExecuted: number;
  recoveries: RecoveryReport;
  errors: string[];
  screenshots: {
    before?: string;
    after?: string;
    failure?: string;
  };
  metrics: {
    planningTimeMs: number;
    observationTimeMs: number;
    executionTimeMs: number;
    recoveryCount: number;
    successRate: number;
  };
  actionHistory?: ActionHistoryEntry[];
}

export interface LogEntry {
  message: string;
  timestamp: string;
}
