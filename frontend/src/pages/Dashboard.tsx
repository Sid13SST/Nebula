import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { PageObservation, ActionPlan, ExecutionReport as ReportType, LogEntry, ActionHistoryEntry } from '../types/agent';
import { TaskForm } from '../components/TaskForm';
import { AgentStatus } from '../components/AgentStatus';
import { ObservationPanel } from '../components/ObservationPanel';
import { ReasoningPanel } from '../components/ReasoningPanel';
import { PlanViewer } from '../components/PlanViewer';
import { ExecutionTimeline } from '../components/ExecutionTimeline';
import { ScreenshotViewer } from '../components/ScreenshotViewer';
import { MetricsPanel } from '../components/MetricsPanel';
import { AgentActivityFeed } from '../components/AgentActivityFeed';
import { ExecutionReport } from '../components/ExecutionReport';

export const Dashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Pending');
  const [observation, setObservation] = useState<PageObservation | null>(null);
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<ReportType | null>(null);
  const [screenshots, setScreenshots] = useState<{ before?: string; after?: string; failure?: string }>({});
  const [history, setHistory] = useState<ActionHistoryEntry[]>([]);

  // Fetch initial states if any
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const statusRes = await api.getStatus();
        setStatus(statusRes.status);
        setIsRunning(statusRes.isRunning);

        const obsRes = await api.getObservation();
        if (obsRes && obsRes.elements) setObservation(obsRes);

        const planRes = await api.getPlan();
        if (planRes && planRes.actions) setPlan(planRes);

        const reportRes = await api.getReport();
        if (reportRes) {
          setReport(reportRes);
          setHistory(reportRes.actionHistory || []);
          setScreenshots(reportRes.screenshots || {});
        }
      } catch (err) {
        console.error('Failed to load initial server state:', err);
      }
    };
    fetchInit();
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    const eventStreamUrl = api.getEventStreamUrl();
    const sse = new EventSource(eventStreamUrl);

    sse.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.state);
      if (data.state === 'Running' || data.state === 'Observation Running' || data.state === 'Planning Running' || data.state === 'Execution Running' || data.state === 'Recovery Running') {
        setIsRunning(true);
      } else if (data.state === 'Completed' || data.state === 'Failed' || data.state === 'Pending') {
        setIsRunning(false);
      }
    });

    sse.addEventListener('observation', (e) => {
      const data = JSON.parse(e.data);
      setObservation(data);
    });

    sse.addEventListener('plan', (e) => {
      const data = JSON.parse(e.data);
      setPlan(data);
    });

    sse.addEventListener('log', (e) => {
      const data = JSON.parse(e.data);
      setLogs((prev) => [...prev, data]);
    });

    sse.addEventListener('report', (e) => {
      const data = JSON.parse(e.data);
      setReport(data);
      setHistory(data.actionHistory || []);
      setScreenshots(data.screenshots || {});
    });

    sse.onerror = (err) => {
      console.warn('SSE EventSource error:', err);
    };

    return () => {
      sse.close();
    };
  }, []);

  const handleRun = async (url: string, goal: string) => {
    setIsRunning(true);
    setLogs([]);
    setHistory([]);
    setScreenshots({});
    setReport(null);
    setObservation(null);
    setPlan(null);
    setStatus('Running');
    
    try {
      await api.runAgent(url, goal);
    } catch (err: any) {
      console.error('Failed to run agent:', err);
      setStatus('Failed');
      setIsRunning(false);
      setLogs((prev) => [
        ...prev,
        { message: `Error: ${err.response?.data?.error || err.message}`, timestamp: new Date().toISOString() },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Nebula Logo" className="w-10 h-10 rounded-full border border-zinc-850 shadow-[0_0_12px_rgba(138,43,226,0.4)]" />
          <div>
            <h1 className="text-base font-black tracking-wider flex items-center gap-2">
              NEBULA
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400">
                v1.0.0
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
              Autonomous Browser Intelligence
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-850 px-3.5 py-1.5 rounded-full">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan-500 animate-ping' : 'bg-zinc-650'}`}></span>
          <span className="text-xs font-semibold text-zinc-400">
            {isRunning ? 'Agent Active' : 'Idle'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Task Form */}
        <TaskForm onRun={handleRun} isRunning={isRunning} />

        {/* Agent Step Status Bar */}
        <AgentStatus currentStatus={status} />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Cognition / Planning / DOM) - 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            <ObservationPanel observation={observation} />
            <ReasoningPanel plan={plan} />
            <PlanViewer plan={plan} />
          </div>

          {/* Right Column (Logs / Metrics / Timelines) - 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
            <ExecutionTimeline history={history} />
            <MetricsPanel report={report} />
            <AgentActivityFeed logs={logs} />
          </div>
        </div>

        {/* Screenshots Section */}
        <ScreenshotViewer screenshots={screenshots} />

        {/* Final Execution Summary */}
        <ExecutionReport report={report} />
      </main>
    </div>
  );
};
export default Dashboard;
