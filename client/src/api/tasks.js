const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export function fetchTasks(filter = 'all') {
  const query = filter && filter !== 'all' ? `?filter=${encodeURIComponent(filter)}` : '';
  return request(`/api/tasks${query}`);
}

export function createTask({ title, description }) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
}

export function updateTask(id, updates) {
  return request(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}
