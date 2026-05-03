const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getConfig = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('ttm_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { headers };
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
};

export const authRequest = async (path, method = 'GET', body) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
};

export const request = async (path, method = 'GET', body) => {
  const { headers } = getConfig();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
};
