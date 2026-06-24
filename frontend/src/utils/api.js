export function apiFetch(endpoint, token, options = {}) {
  return fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
