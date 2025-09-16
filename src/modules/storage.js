// src/modules/storage.js
const STORAGE_KEY = "todoDashboardData";

export function saveData(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}
