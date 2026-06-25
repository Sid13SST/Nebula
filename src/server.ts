import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { agentEvents } from './logging/eventManager.js';
import { AutomationAgent } from './agent/agent.js';
import { openBrowser } from './tools/openBrowser.js';
import { navigateToUrl } from './tools/navigateToUrl.js';
import { BrowserManager } from './browser/browserManager.js';
import { env } from './config/env.js';

const app = express();
app.use(cors());
app.use(express.json());

// Serve screenshots static folder
app.use('/screenshots', express.static(path.join(process.cwd(), 'screenshots')));

// Serve frontend static files
app.use(express.static(path.join(process.cwd(), 'frontend', 'dist')));

let currentStatus = 'Pending';
let latestObservation: any = null;
let latestPlan: any = null;
let latestReport: any = null;
let isRunning = false;

// SSE subscribers
let clients: any[] = [];

function sendSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {}
  });
}

// Subscribe to agentEvents and broadcast to SSE
agentEvents.on('status', (data) => {
  currentStatus = data.state;
  sendSSE('status', { state: currentStatus });
});

agentEvents.on('observation', (data) => {
  latestObservation = data;
  sendSSE('observation', data);
});

agentEvents.on('plan', (data) => {
  latestPlan = data;
  sendSSE('plan', data);
});

agentEvents.on('log', (message) => {
  sendSSE('log', { message, timestamp: new Date().toISOString() });
});

agentEvents.on('report', (data) => {
  latestReport = data;
  sendSSE('report', data);
});

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  
  const clientId = Date.now();
  clients.push({ id: clientId, res });
  
  // Send current state immediately
  res.write(`event: status\ndata: ${JSON.stringify({ state: currentStatus })}\n\n`);
  if (latestObservation) {
    res.write(`event: observation\ndata: ${JSON.stringify(latestObservation)}\n\n`);
  }
  if (latestPlan) {
    res.write(`event: plan\ndata: ${JSON.stringify(latestPlan)}\n\n`);
  }
  if (latestReport) {
    res.write(`event: report\ndata: ${JSON.stringify(latestReport)}\n\n`);
  }

  req.on('close', () => {
    clients = clients.filter((c) => c.id !== clientId);
  });
});

app.post('/api/run', async (req, res) => {
  const { url, goal } = req.body;
  if (!url || !goal) {
    return res.status(400).json({ error: 'URL and Goal are required' });
  }
  if (isRunning) {
    return res.status(400).json({ error: 'Agent is already running' });
  }

  isRunning = true;
  currentStatus = 'Running';
  latestObservation = null;
  latestPlan = null;
  latestReport = null;

  res.json({ success: true, message: 'Agent started' });

  // Run async
  (async () => {
    try {
      agentEvents.emit('status', { state: 'Browser Opened' });
      agentEvents.emit('log', 'Initializing Playwright browser...');
      await openBrowser();
      
      agentEvents.emit('status', { state: 'Page Loaded' });
      agentEvents.emit('log', `Navigating to target URL: ${url}`);
      await navigateToUrl(url);

      const agent = new AutomationAgent();
      const result = await agent.run(goal);

      currentStatus = result.success ? 'Completed' : 'Failed';
      agentEvents.emit('status', { state: currentStatus });

      // Read latest generated report.json
      const reportPath = path.join(process.cwd(), 'reports', 'report.json');
      if (fs.existsSync(reportPath)) {
        const reportContent = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        reportContent.actionHistory = result.actionHistory;
        latestReport = reportContent;
        agentEvents.emit('report', reportContent);
      }
    } catch (err: any) {
      currentStatus = 'Failed';
      agentEvents.emit('status', { state: 'Failed' });
      agentEvents.emit('log', `Critical error: ${err.message}`);
    } finally {
      isRunning = false;
      try {
        await BrowserManager.getInstance().close();
      } catch {}
    }
  })();
});

app.get('/api/status', (req, res) => {
  res.json({ status: currentStatus, isRunning });
});

app.get('/api/observation', (req, res) => {
  res.json(latestObservation || { elements: [] });
});

app.get('/api/plan', (req, res) => {
  res.json(latestPlan || { actions: [] });
});

app.get('/api/report', (req, res) => {
  res.json(latestReport || null);
});

app.get('/api/screenshots/latest', (req, res) => {
  res.json(latestReport?.screenshots || {});
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend', 'dist', 'index.html'));
});

const serverPort = env.PORT || 3000;
export function startServer() {
  app.listen(serverPort, () => {
    console.log(`[Nebula Dashboard Server] Listening on port ${serverPort}`);
  });
}
