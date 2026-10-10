import { API_KEY, BASE_URL } from './config.js';

/**
 * Errors carry a `kind` so the UI can say something specific.
 * "Something went wrong" is not an error message.
 */
export class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; // 'config' | 'network' | 'notfound' | 'ratelimit' | 'server'
  }
}

function kindForStatus(status) {
  if (status === 401) return 'config';
  if (status === 404) return 'notfound';
  if (status === 429) return 'ratelimit';
  return 'server';
}

/**
 * Every network call in the app goes through here, so retries, error
 * shaping, and the key check live in exactly one place.
 */
export async function request(path, params = {}) {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    throw new ApiError('config', 'No TMDB API key is set. See js/config.js.');
  }

  const url = new URL(BASE_URL + path);
  url.searchParams.set('api_key', API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError('network', 'Could not reach TMDB. Check your connection.');
  }

  if (!response.ok) {
    throw new ApiError(kindForStatus(response.status), `TMDB responded ${response.status}.`);
  }

  return response.json();
}

export const discover = (params) => request('/discover/movie', params);
export const search   = (query, page = 1) => request('/search/movie', { query, page, include_adult: false });
export const movie    = (id) => request(`/movie/${id}`);
export const credits  = (id) => request(`/movie/${id}/credits`);
export const videos   = (id) => request(`/movie/${id}/videos`);
