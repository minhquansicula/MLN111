async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { ...options, signal: options.signal ?? AbortSignal.timeout(12000), headers: { "Content-Type": "application/json", ...options.headers } });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") throw new Error("Máy chủ phản hồi quá lâu. Hãy thử lại.");
    throw new Error("Không kết nối được máy chủ. Kiểm tra mạng và thử lại.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Không thể kết nối máy chủ.");
  return data;
}

export const classApi = {
  create: (packId = "complete") => request("/api/class-sessions", { method: "POST", body: JSON.stringify({ packId }) }),
  info: (code) => request(`/api/class-sessions/${encodeURIComponent(code)}`),
  join: (code, playerName) => request(`/api/class-sessions/${encodeURIComponent(code)}/join`, { method: "POST", body: JSON.stringify({ playerName }) }),
  submit: (code, payload) => request(`/api/class-sessions/${encodeURIComponent(code)}/results`, { method: "POST", body: JSON.stringify(payload) }),
  progress: (code, payload, signal) => request(`/api/class-sessions/${encodeURIComponent(code)}/progress`, { method: "PUT", body: JSON.stringify(payload), signal }),
  stats: (code, token) => request(`/api/class-sessions/${encodeURIComponent(code)}/stats`, { headers: { "X-Session-Token": token } }),
  leaderboard: (code, token) => request(`/api/class-sessions/${encodeURIComponent(code)}/leaderboard`, { headers: { "X-Session-Token": token } }),
};
