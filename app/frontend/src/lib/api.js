"import axios from \"axios\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const http = axios.create({
  baseURL: API,
  headers: { \"Content-Type\": \"application/json\" },
});

// Attach token dynamically
export const setAuthToken = (token) => {
  if (token) {
    http.defaults.headers.common[\"Authorization\"] = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common[\"Authorization\"];
  }
};

// ============ API helpers ============
export const apiLogin = (username, password, role) =>
  http.post(\"/auth/login\", { username, password, role }).then((r) => r.data);

export const apiListProjects = () =>
  http.get(\"/projects\").then((r) => r.data);

export const apiCreateProject = (payload) =>
  http.post(\"/projects\", payload).then((r) => r.data);

export const apiListTasks = () => http.get(\"/tasks\").then((r) => r.data);

export const apiCreateTask = (payload) =>
  http.post(\"/tasks\", payload).then((r) => r.data);

export const apiUpdateTaskStatus = (id, status) =>
  http.patch(`/tasks/${id}`, { status }).then((r) => r.data);
"