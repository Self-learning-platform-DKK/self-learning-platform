const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sqlt_access_token');
}

// In-memory cache for GET request promises to enable instant client-side page transitions
const apiCache = new Map<string, Promise<any>>();

export function invalidateApiCache(path?: string) {
  if (path) {
    const token = getToken();
    apiCache.delete(`${path}:${token || ''}`);
  } else {
    apiCache.clear();
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() || 'GET';
  const token = getToken();
  const cacheKey = `${path}:${token || ''}`;

  // Flush cache immediately on mutations (POST, PUT, DELETE) to guarantee fresh data
  if (method !== 'GET') {
    apiCache.clear();
  } else if (apiCache.has(cacheKey)) {
    // Return the cached promise directly
    return apiCache.get(cacheKey) as Promise<T>;
  }

  const promise = (async () => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `API error ${res.status}`);
    }
    return res.json();
  })();

  // Cache resolved/pending promise for subsequent GET requests
  if (method === 'GET') {
    apiCache.set(cacheKey, promise);
    // Delete from cache on network failures so we can retry on next request
    promise.catch(() => {
      apiCache.delete(cacheKey);
    });
  }

  return promise;
}

export function setTokens(accessToken: string) {
  localStorage.setItem('sqlt_access_token', accessToken);
  invalidateApiCache(); // Invalidate cache since user identity changed
}

export function clearTokens() {
  localStorage.removeItem('sqlt_access_token');
  invalidateApiCache(); // Invalidate cache since user logged out
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem('sqlt_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('sqlt_session', id);
  }
  return id;
}
