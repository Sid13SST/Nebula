import { EventEmitter } from 'events';

class AgentEventManager extends EventEmitter {
  private static instance: AgentEventManager;
  
  private constructor() {
    super();
    // Allow unlimited listeners
    this.setMaxListeners(0);
  }
  
  public static getInstance(): AgentEventManager {
    if (!AgentEventManager.instance) {
      AgentEventManager.instance = new AgentEventManager();
    }
    return AgentEventManager.instance;
  }
}

export const agentEvents = AgentEventManager.getInstance();
export default agentEvents;
