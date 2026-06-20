<p align="center">
  <img src="assets/logo.png" alt="Nebula Logo" width="100" />
</p>

# 🎓 Nebula Academic Viva Preparation Guide

This guide prepares you for academic evaluation, project defense, or portfolio presentations of Nebula.


## Core Viva Questions and Answers

### Q1: What is Nebula, and what problem does it solve?
**A:** Nebula is an autonomous AI browser automation agent. Standard browser testing frameworks (like Playwright/Selenium) are highly brittle because element selectors, IDs, and layouts change frequently. Nebula resolves this by combining real-time DOM observation, Google Gemini AI planning, action state verification, and runtime self-healing (selector recovery and re-planning) to execute tasks resiliently.

### Q2: Explain the workflow of the agent.
**A:** Nebula runs a loop consisting of:
1. **Observe**: ElementExtractor evaluates the page context to locate interactive elements (inputs, textareas, buttons) and resolves labels.
2. **Plan**: Planner formats a prompt containing the goals and elements, and queries Gemini for a structured JSON action plan.
3. **Execute**: Executor dispatches actions to Playwright tools.
4. **Verify**: VerificationEngine checks if the action successfully changed page state.
5. **Recover**: If verification fails, SelectorRecovery corrects selectors using label/placeholder matching, falling back to AI re-planning if needed.

### Q3: How is Google Gemini integrated into Nebula?
**A:** We use `@google/generative-ai` with model `gemini-2.5-flash`. To guarantee structured inputs, we configure Gemini's `responseMimeType: 'application/json'` and supply an OpenAPI-compliant schema definition defining the required properties (`reasoning`, `actions` array).

### Q4: How is Zod validation used?
**A:** Zod ensures type-safety and structural validity at runtime. We validate:
1. Environment variables at startup (`src/config/env.ts`).
2. Gemini Client JSON plans (`src/types/action.ts`) to ensure that all actions contain appropriate enums and attributes before dispatching to Playwright.

### Q5: What is the tool registry design pattern?
**A:** Instead of using complex nested switch statements, the Executor utilizes a tool registry map. Action types (`CLICK`, `SEND_KEYS`, etc.) are mapped directly to corresponding async tool functions. This keeps the design aligned with the Open/Closed Principle (SOLID), making it easy to add new browser tools.

### Q6: How does the self-healing recovery system operate?
**A:** When a tool fails (e.g. locator timeout), the executor intercepts the error and calls `RecoveryManager`. The system re-observes the page, parses keywords from the failed selector, and matches them to visible interactive elements in the new observation by evaluating labels, placeholders, aria attributes, or names. If a corrected selector is resolved, it updates the action and proceeds with execution.
