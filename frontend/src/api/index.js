import API from "./api";

// ── Courses ───────────────────────────────────────────────────────────────────
export const courseAPI = {
  getAll:   (token) => API.get("/courses", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  getOne:   (id, token) => API.get(`/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  create:   (data, token) => API.post("/courses", data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  update:   (id, data, token) => API.put(`/courses/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  remove:   (id, token) => API.delete(`/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  enroll:   (id, token) => API.post(`/courses/${id}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  unenroll: (id, token) => API.post(`/courses/${id}/unenroll`, {}, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
};

// ── Assignments ───────────────────────────────────────────────────────────────
export const assignmentAPI = {
  getMy:       (token) => API.get("/assignments/my", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  getByCourse: (courseId, token) => API.get(`/assignments/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  create:      (data, token) => API.post("/assignments", data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  submit:      (id, data, token) => API.post(`/assignments/${id}/submit`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  grade:       (id, studentId, data, token) => API.put(`/assignments/${id}/grade/${studentId}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  remove:      (id, token) => API.delete(`/assignments/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  getMy:       (token) => API.get("/attendance/my", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  getByCourse: (courseId, token) => API.get(`/attendance/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  mark:        (data, token) => API.post("/attendance/mark", data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
};

// ── Results ───────────────────────────────────────────────────────────────────
export const resultAPI = {
  getMy:       (token) => API.get("/results/my", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  getByCourse: (courseId, token) => API.get(`/results/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  upload:      (data, token) => API.post("/results", data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  remove:      (id, token) => API.delete(`/results/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
};

// ── Notices ───────────────────────────────────────────────────────────────────
export const noticeAPI = {
  getAll: (token) => API.get("/notices", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  create: (data, token) => API.post("/notices", data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  remove: (id, token) => API.delete(`/notices/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
};