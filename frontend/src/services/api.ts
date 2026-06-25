import axios from 'axios';
import type { PageObservation, ActionPlan, ExecutionReport } from '../types/agent';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  runAgent: async (url: string, goal: string) => {
    const response = await axios.post(`${API_BASE}/api/run`, { url, goal });
    return response.data;
  },

  getStatus: async () => {
    const response = await axios.get(`${API_BASE}/api/status`);
    return response.data;
  },

  getObservation: async (): Promise<PageObservation> => {
    const response = await axios.get(`${API_BASE}/api/observation`);
    return response.data;
  },

  getPlan: async (): Promise<ActionPlan> => {
    const response = await axios.get(`${API_BASE}/api/plan`);
    return response.data;
  },

  getReport: async (): Promise<ExecutionReport | null> => {
    const response = await axios.get(`${API_BASE}/api/report`);
    return response.data;
  },

  getLatestScreenshots: async () => {
    const response = await axios.get(`${API_BASE}/api/screenshots/latest`);
    return response.data;
  },

  getEventStreamUrl: () => {
    return `${API_BASE}/api/events`;
  },
  
  getScreenshotUrl: (relativePath: string) => {
    if (!relativePath) return '';
    // Normalize path separators for URL
    const normalized = relativePath.replace(/\\/g, '/');
    const index = normalized.indexOf('/screenshots/');
    if (index !== -1) {
      return `${API_BASE}${normalized.substring(index)}`;
    }
    return `${API_BASE}/screenshots/${pathBasename(relativePath)}`;
  }
};

function pathBasename(pathStr: string): string {
  return pathStr.split(/[\\/]/).pop() || '';
}

export default api;
