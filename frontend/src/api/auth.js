import API from "./api";

export const authAPI = {
  login: (email, password) =>
    API.post("/auth/login", { email, password }).then((r) => r.data),

  register: (data) =>
    API.post("/auth/register", data).then((r) => r.data),

  me: (token) =>
    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.data),
};