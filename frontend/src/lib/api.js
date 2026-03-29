import axios from "axios";

const baseURL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function getStoredToken() {
  return localStorage.getItem("token");
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export function signup(body) {
  return api.post("/auth/signup", body);
}

export function login(body) {
  return api.post("/auth/login", body);
}

export function verifyEmail(token) {
  return api.get(`/auth/verify-email/${encodeURIComponent(token)}`);
}

export function forgotPassword(body) {
  return api.post("/auth/forgot-password", body);
}

export function resetPassword(body) {
  return api.post("/auth/reset-password", body);
}

export function logout() {
  return api.post("/auth/logout");
}

export function createAssessment(body) {
  return api.post("/assessments/create", body);
}

export function getAssessment(id) {
  return api.get(`/assessments/${id}`);
}

export function getUserAssessments() {
  return api.get("/user/assessments");
}

export function getRemediation(assessmentId) {
  return api.get(`/remediation/${assessmentId}`);
}

export function markActionComplete(actionId) {
  return api.post("/remediation-actions/mark-complete", { actionId });
}

export function getBrokers() {
  return api.get("/brokers");
}

export function createCheckout(body) {
  return api.post("/payment/create-checkout", body);
}

export function getSubscription() {
  return api.get("/user/subscription");
}

export function getProfile() {
  return api.get("/user/profile");
}

export function updateProfile(body) {
  return api.put("/user/profile", body);
}

export function changePassword(body) {
  return api.put("/user/password", body);
}

export function deleteAccount() {
  return api.delete("/user/account");
}

export { api, getStoredToken };
