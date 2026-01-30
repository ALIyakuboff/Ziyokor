import { apiFetch } from "./client";
export async function listWorkers() {
    return apiFetch("/admin/workers");
}
export async function createWorker(full_name, phone_login) {
    return apiFetch("/admin/workers", {
        method: "POST",
        body: JSON.stringify({ full_name, phone_login })
    });
}
export async function getWorkerWeek(workerId, anchor) {
    const q = anchor ? `?anchor=${encodeURIComponent(anchor)}` : "";
    return apiFetch(`/admin/workers/${workerId}/week${q}`);
}
export async function getAnalytics(range, anchor, workerId) {
    const q = `?range=${range}&anchor=${encodeURIComponent(anchor)}${workerId ? `&workerId=${encodeURIComponent(workerId)}` : ""}`;
    return apiFetch(`/admin/analytics${q}`);
}
export async function createOneOffMandatoryTask(userId, title, date) {
    return apiFetch("/admin/mandatory/one-off", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, title, date })
    });
}
export async function getTaskComments(taskId) {
    return apiFetch(`/tasks/${taskId}/comments`);
}
export async function deactivateWorker(workerId) {
    return apiFetch(`/admin/workers/${workerId}/deactivate`, {
        method: "PATCH"
    });
}
export async function deleteTaskAdmin(taskId) {
    return apiFetch(`/admin/tasks/${taskId}`, {
        method: "DELETE"
    });
}
export async function getFullReportData(start, end) {
    return apiFetch(`/admin/reports/full?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
}
