<p align="center">
  <img src="assets/logo.png" alt="Nebula Logo" width="100" />
</p>

# 🩹 Nebula Self-Healing & Recovery System

Nebula's core strength lies in its self-healing engine, which mitigates execution brittleness by performing action verification, alternative selector matching, and AI re-planning at runtime.


## Recovery Pipeline

```
  [Execute Action]
         │
         ▼
  [Verify Action State] ───► (Success) ───► [Proceed to Next Action]
         │
      (Failure)
         │
         ▼
  [Re-Observe Page]
         │
         ▼
  [Selector Recovery Engine] ───► (Alternative Found) ───► [Execute Fallback & Re-Verify]
         │                                                      │
      (Failed)                                             (Verified)
         │                                                      │
         ├──────────────────────────────────────────────────────┴───► [Success]
         ▼
  [Exponential Retry Loop] ───► (Success) ───► [Success]
         │
      (Failed)
         │
         ▼
  [AI Re-planning Workflow] ───► [Generate New Plan] ───► [Re-Execute]
```

### 1. Action Verification (`VerificationEngine`)
Before declaring success, Nebula verifies actions:
- **`NAVIGATE`**: Checks page URL substring patterns.
- **`SEND_KEYS`**: Inspects page DOM input/textarea node value against the expected string.
- **`CLICK` / `DOUBLE_CLICK`**: Asserts target locator presence.
- **`SCROLL`**: Evaluates window offset coordinates.

### 2. Selector Recovery Fallback (`SelectorRecovery`)
If an action fails (e.g. selector was renamed or mapped incorrectly), the recovery engine parses DOM elements and matches them based on:
1. **Keyword Substring Match**: Searches failed selectors for keywords (e.g., matching `"title"` to label `"Bug Title"`).
2. **Label Context Match**: Searches elements for label associations.
3. **Placeholder / ARIA Match**: Resolves items by placeholder text or ARIA descriptors.

### 3. AI Re-planning (`RecoveryManager`)
If selector recovery and retry steps fail:
- Re-observes the webpage to parse updated structures.
- Generates a new planning request containing the original goal, active observation elements, and a detailed execution failure error message.
- Gemini adjusts the planned selectors/actions, and execution proceeds with the new plan.
