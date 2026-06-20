import { Planner } from '../agent/planner.js';
import { GeminiClient } from '../llm/geminiClient.js';
import { PageObservation } from '../types/observation.js';
import { ElementType } from '../types/element.js';
import { logger } from '../logging/logger.js';

async function runPlannerDemo() {
  logger.info('--- Starting Planner Demo ---');

  // 1. Mock PageObservation loading
  const mockObservation: PageObservation = {
    timestamp: new Date(),
    summary: 'Page observation of Shadcn Forms',
    title: 'React Hook Form - shadcn/ui',
    url: 'https://ui.shadcn.com/docs/forms/react-hook-form',
    elements: [
      {
        id: 'form-rhf-demo-title',
        type: ElementType.INPUT,
        tagName: 'input',
        selector: '#form-rhf-demo-title',
        text: '',
        attributes: { id: 'form-rhf-demo-title', placeholder: 'Bug title' },
        isVisible: true,
        isDisabled: false,
        name: 'title',
        label: 'Bug Title',
        placeholder: 'Bug title',
      },
      {
        id: 'form-rhf-demo-description',
        type: ElementType.TEXTAREA,
        tagName: 'textarea',
        selector: '#form-rhf-demo-description',
        text: '',
        attributes: { id: 'form-rhf-demo-description', placeholder: 'Description' },
        isVisible: true,
        isDisabled: false,
        name: 'description',
        label: 'Description',
        placeholder: 'Description',
      },
    ],
  };

  // 2. Initialize GeminiClient and check if we need to mock API responses
  const geminiClient = new GeminiClient();
  
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (apiKey.startsWith('dummy') || !apiKey) {
    logger.warn('Dummy API Key detected. Stubbing GeminiClient response for testing.');
    geminiClient.generateStructuredResponse = async (prompt, schema, systemInstruction) => {
      logger.info('[STUB] Returning simulated JSON action plan matching schema.');
      return JSON.stringify({
        reasoning: "I will fill in the 'Bug Title' (Name) field and the 'Description' textarea field.",
        actions: [
          {
            action: 'SEND_KEYS',
            selector: '#form-rhf-demo-title',
            value: 'Sandbox Bug Test',
          },
          {
            action: 'SEND_KEYS',
            selector: '#form-rhf-demo-description',
            value: 'This is a description generated during testing.',
          },
        ],
      });
    };
  }

  // 3. Initialize Planner and generate plan
  const planner = new Planner(geminiClient);
  const goal = 'Fill the Name and Description fields';

  try {
    const plan = await planner.plan(goal, mockObservation);
    
    console.log('--- VALIDATED ACTION PLAN ---');
    console.log(JSON.stringify(plan, null, 2));
    
    logger.info('--- Planner Demo Completed Successfully ---');
  } catch (error) {
    logger.error('Planner Demo failed:', error);
    process.exit(1);
  }
}

runPlannerDemo();
