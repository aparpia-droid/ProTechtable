import axios from "axios";

const baseURL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

let isRedirecting = false;

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !isRedirecting) {
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const publicPaths = ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password", "/"];
      if (!publicPaths.includes(path)) {
        isRedirecting = true;
        setTimeout(() => {
          window.location.href = "/login";
          setTimeout(() => { isRedirecting = false; }, 2000);
        }, 100);
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

export function resendVerification(body) {
  return api.post("/auth/resend-verification", body);
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

export function getBrokerRemovals() {
  return api.get("/broker-removals");
}

export function requestBrokerRemoval(brokerId) {
  return api.post(`/broker-removals/${brokerId}/request`);
}

export function confirmBrokerRemoval(brokerId) {
  return api.post(`/broker-removals/${brokerId}/confirm`);
}

export function requestAllBrokerRemovals() {
  return api.post("/broker-removals/request-all");
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

export function deleteAccount(body) {
  return api.delete("/user/account", { data: body });
}

export function listFamilyEmails() {
  return api.get("/user/emails");
}

export function addFamilyEmail(body) {
  return api.post("/user/emails", body);
}

export function verifyFamilyEmail(id, body) {
  return api.post(`/user/emails/${id}/verify`, body);
}

export function deleteFamilyEmail(id) {
  return api.delete(`/user/emails/${id}`);
}

export function getAlerts() {
  return api.get("/alerts");
}

export function markAlertRead(id) {
  return api.post(`/alerts/${id}/read`);
}

export function markAllAlertsRead() {
  return api.post("/alerts/read-all");
}

export function toggleMonitoring(enabled) {
  return api.post("/user/monitoring", { enabled });
}

export { api };
