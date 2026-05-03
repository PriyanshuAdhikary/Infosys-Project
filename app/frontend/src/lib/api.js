// app/frontend/src/lib/api.js

// IMPORTANT: Once deployed to Railway, change this to your Railway URL
// e.g., const API_BASE_URL = "https://your-app-name.up.railway.app/api";
const API_BASE_URL = "http://localhost:8000/api"; 

// Helper function to get the token from local storage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });
  
  if (!response.ok) throw new Error("Invalid credentials");
  return await response.json();
};

export const fetchProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return await response.json();
};

export const fetchTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return await response.json();
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return await response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return await response.json();
};