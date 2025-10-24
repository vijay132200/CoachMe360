const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const staticDataMap: Record<string, string> = {
  '/api/managers': '/data/managers.json',
  '/api/competencies': '/data/competencies.json',
  '/api/dashboard/radar': '/data/dashboard-radar.json',
  '/api/dashboard/trends': '/data/dashboard-trends.json',
  '/api/dashboard/pulse': '/data/dashboard-pulse.json',
  '/api/pulse/history': '/data/pulse-history.json',
  '/api/journal/entries': '/data/journal-entries.json',
  '/api/grow/goals': '/data/grow-goals.json',
  '/api/roleplay/sessions': '/data/roleplay-sessions.json',
  '/api/admin/stats': '/data/admin-stats.json',
};

export const isStaticMode = !API_BASE_URL;

async function fetchWithFallback(url: string, options?: RequestInit): Promise<Response> {
  if (!API_BASE_URL) {
    const staticPath = staticDataMap[url];
    if (staticPath) {
      return fetch(staticPath);
    }
    throw new Error(`No API available and no static fallback for ${url}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    if (!response.ok) {
      const staticPath = staticDataMap[url];
      if (staticPath) {
        console.warn(`API returned ${response.status} for ${url}, falling back to static data`);
        return fetch(staticPath);
      }
    }
    return response;
  } catch (error) {
    const staticPath = staticDataMap[url];
    if (staticPath) {
      console.warn(`API request failed for ${url}, falling back to static data`);
      return fetch(staticPath);
    }
    throw error;
  }
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithFallback(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
  if (isStaticMode) {
    throw new Error('Cannot submit data in static mode. Please configure VITE_API_BASE_URL.');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}
