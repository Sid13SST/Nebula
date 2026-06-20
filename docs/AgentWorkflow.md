<p align="center">
  <img src="assets/logo.png" alt="Nebula Logo" width="100" />
</p>

# 🔄 Nebula Agent Workflow

Nebula orchestrates browser interactions through an autonomous, reactive loop: **Observe -> Plan -> Execute -> Verify -> Recover -> Re-plan**.


## Step-by-Step Workflow

```mermaid
sequenceDiagram
  participant U as User / Goal
  participant A as AutomationAgent
  participant O as PageObserver
  participant P as Planner
  participant G as Gemini API
  participant E as Executor
  participant B as Browser

  U->>A: Start Agent with Goal
  loop Orchestration Loop
    A->>O: 1. Observe Page State
    O->>B: Query DOM & Extract Elements
    B-->>O: DOM Data
    O-->>A: PageObservation
    A->>P: 2. Request Next Action Plan
    P->>G: Send Action Prompt & Schema
    G-->>P: Structured JSON Plan
    P-->>A: ActionPlan (Validated by Zod)
    A->>E: 3. Dispatch Plan Execution
    loop Action Execution
      E->>B: Execute Tool Action
      E->>B: 4. Verify Action Success
      alt Action verification fails
        E->>A: Trigger Self-Healing Recovery
        A->>O: Re-observe DOM elements
        O-->>A: New elements
        A->>E: Try Recovery Selector
        E->>B: Execute corrected action
      end
    end
    E-->>A: ExecutionResult
    alt Plan execution fails
      A->>P: 5. Request AI Re-planning
      P->>G: Send goal + execution failure context
      G-->>A: Adjusted ActionPlan
    end
  end
  A-->>U: Final Report & Timeline
```

### 1. Observe Page
- Navigates target page and queries visible elements.
- Captures a "before" screenshot saved under `/screenshots/before/`.

### 2. Plan
- Generates prompt combining current URL, page title, interactive inputs, and user goal.
- Submits structured JSON request to Gemini client.
- Zod schema validates plan attributes.

### 3. Execute
- Dispatches planned actions via the Executor tool registry.
- Checks preconditions (selector visibility, parameter types).

### 4. Verify & Self-Heal
- Passes action outcomes to the verification engine.
- If verification fails (e.g. selector mismatch), triggers selector recovery.
- If selector recovery is successful, executes corrected actions.

### 5. AI Re-planning
- If execution remains unsuccessful, triggers a re-plan.
- Sends the failure message and new observation back to Gemini to obtain an adjusted plan.

### 6. Completion
- Finalizes metrics tracking.
- Generates `/reports/report.json` and sorts screenshots under `/screenshots/after/` or `/screenshots/failures/`.
