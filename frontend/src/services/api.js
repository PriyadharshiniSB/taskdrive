import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  updatePassword: (data) => api.patch('/auth/password', data),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Backend serves uploaded files (avatars, drive files) from the root, not
// under /api — so an avatarUrl like "/uploads/avatars/x.png" needs the /api
// suffix stripped off the base URL before it becomes a usable <img src>.
export const getServerOrigin = () => API_BASE_URL.replace(/\/api\/?$/, '');

export const filesAPI = {
  getFiles: (folderId) => api.get('/files', { params: { folderId } }),
  uploadFile: (formData, onUploadProgress) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onUploadProgress
      ? (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      : undefined
  }),
  downloadFile: (id) => api.get(`/files/download/${id}`, { responseType: 'blob' }),
  deleteFile: (id) => api.delete(`/files/${id}`),
  renameFile: (id, name) => api.patch(`/files/${id}/rename`, { name }),
  getFileInfo: (id) => api.get(`/files/${id}`),
  getTotalStorage: () => api.get('/files/storage/total'),
  getTrash: () => api.get('/files/trash/list'),
  restoreFile: (id) => api.patch(`/files/${id}/restore`),
  permanentDeleteFile: (id) => api.delete(`/files/${id}/permanent`),
  shareFile: (id) => api.post(`/files/${id}/share`),
  unshareFile: (id) => api.delete(`/files/${id}/share`),
};

export const foldersAPI = {
  createFolder: (folderData) => api.post('/folders', folderData),
  getFolderContents: (id) => api.get(`/folders/${id}`),
  deleteFolder: (id) => api.delete(`/folders/${id}`),
  renameFolder: (id, name) => api.patch(`/folders/${id}/rename`, { name }),
  restoreFolder: (id) => api.patch(`/folders/${id}/restore`),
  permanentDeleteFolder: (id) => api.delete(`/folders/${id}/permanent`),
  setFolderColor: (id, color) => api.patch(`/folders/${id}/color`, { color }),
  shareFolder: (id) => api.post(`/folders/${id}/share`),
  unshareFolder: (id) => api.delete(`/folders/${id}/share`),
};

export const todosAPI = {
  getTodos: () => api.get('/todos'),
  createTodo: (text) => api.post('/todos', { text }),
  toggleTodo: (id) => api.patch(`/todos/${id}/toggle`),
  renameTodo: (id, text) => api.patch(`/todos/${id}/rename`, { text }),
  deleteTodo: (id) => api.delete(`/todos/${id}`),
};

// Note: publicAPI intentionally uses a fresh axios call, not the `api`
// instance above — the shared instance attaches an auth token if one
// exists in localStorage, but a public share link must work identically
// for a logged-out visitor, so it shouldn't depend on that at all.
export const publicAPI = {
  // Works for both types now — response includes `type: 'file' | 'folder'`
  // so SharedFilePage.js can branch on that.
  getSharedFile: (shareId) => axios.get(`${API_BASE_URL}/public/${shareId}`),
  getSharedFileDownloadUrl: (shareId) => `${API_BASE_URL}/public/${shareId}/download`,
  // For a single file living inside a shared folder (not shared on its own)
  getSharedFolderFileDownloadUrl: (shareId, fileId) => `${API_BASE_URL}/public/${shareId}/file/${fileId}/download`,
};

export const activityAPI = {
  // page starts at 1. limit defaults to 20 to match the backend default —
  // kept explicit here so ActivityPage.js can pass whatever it wants.
  getActivity: (page = 1, limit = 20) => api.get('/activity', { params: { page, limit } }),
  clearActivity: () => api.delete('/activity'),
};

export default api;