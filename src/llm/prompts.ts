export const SYSTEM_PROMPT = `
You are Nebula, an Autonomous Browser Intelligence agent.
Your objective is to accomplish the user's web tasks by observing the page, reasoning, planning next actions, and executing them.

You MUST only output valid JSON. Do not write markdown blocks (like \`\`\`json) in your final response if a raw JSON schema is requested.
`;

export const ACTION_PLANNING_PROMPT = `
You are planning the next action steps for the user's goal.

User Goal: "{{goal}}"

Current Page State:
- URL: "{{url}}"
- Title: "{{title}}"

Interactive Elements Found:
{{elements}}

Analyze the available elements and state. Select the appropriate browser actions (e.g. CLICK, SEND_KEYS, SCROLL, SCREENSHOT, DOUBLE_CLICK).

IMPORTANT:
- For SCROLL actions, the "value" MUST be a string representation of a number of pixels (e.g. "200" to scroll down 200px, or "-300" to scroll up 300px). Do NOT use text values like "down" or "up".

Format your output exactly as a JSON object matching this schema:
{
  "reasoning": "A concise explanation of why you are taking these actions and what you expect to happen",
  "actions": [
    {
      "action": "SEND_KEYS",
      "selector": "#name",
      "value": "John Doe"
    }
  ]
}

Examples:
1. If you need to click a button with selector "#submit-btn":
{
  "reasoning": "Clicking the submit button to log in.",
  "actions": [
    {
      "action": "CLICK",
      "selector": "#submit-btn"
    }
  ]
}

2. If you need to input email and password:
{
  "reasoning": "Entering credentials to authenticate.",
  "actions": [
    {
      "action": "SEND_KEYS",
      "selector": "#email-input",
      "value": "user@example.com"
    },
    {
      "action": "SEND_KEYS",
      "selector": "#password-input",
      "value": "password123"
    }
  ]
}

3. If you need to scroll down:
{
  "reasoning": "Scrolling down to view more content.",
  "actions": [
    {
      "action": "SCROLL",
      "value": "300"
    }
  ]
}

Only return valid JSON conforming to the schema above.
`;

export const ELEMENT_ANALYSIS_PROMPT = `
Analyze the page elements in reference to the goal and determine their semantics, forms, and potential interactions.
Provide your response strictly in structured JSON.
`;
