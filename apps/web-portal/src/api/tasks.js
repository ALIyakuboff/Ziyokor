import { apiFetch } from "./client";
// --- Admin APIs ---
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
export async function createOneOffMandatoryTask(userId, title, date) {
    return apiFetch("/admin/mandatory/one-off", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, title, date })
    });
}
export async function deactivateWorker(workerId) {
    return apiFetch(`/admin/workers/${workerId}/deactivate`, {
        method: "PATCH"
    });
}
// --- Worker APIs ---
export async function getMyWeek(anchor) {
    const q = anchor ? `?anchor=${encodeURIComponent(anchor)}` : "";
    return apiFetch(`/tasks/me/week${q}`);
}
export async function createMyTask(title, date) {
    return apiFetch(`/tasks/me`, {
        method: "POST",
        body: JSON.stringify({ title, date })
    });
}
export async function startTask(id) {
    return apiFetch(`/tasks/${id}/start`, { method: "PATCH" });
}
export async function doneTask(id) {
    return apiFetch(`/tasks/${id}/done`, { method: "PATCH" });
}
export async function deleteTask(id) {
    return apiFetch(`/tasks/${id}`, { method: "DELETE" });
}
// --- Shared APIs (Comments & Analytics) ---
export async function getTaskComments(taskId) {
    return apiFetch(`/tasks/${taskId}/comments`);
}
export async function addComment(taskId, items) {
    return apiFetch(`/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ items })
    });
}
export async function replaceComments(taskId, items) {
    return apiFetch(`/tasks/${taskId}/comments`, {
        method: "PUT",
        body: JSON.stringify({ items })
    });
}
export async function getAnalytics(range, anchor, workerId) {
    const q = `?range=${range}&anchor=${encodeURIComponent(anchor)}${workerId ? `&workerId=${encodeURIComponent(workerId)}` : ""}`;
    // Consistency: we use the robust admin/analytics endpoint which now handles worker-level permission isolation
    return apiFetch(`/admin/analytics${q}`);
}
export async function createRecurringTemplate(user_ids, titles, is_mandatory = true, recurrence = "daily") {
    return apiFetch("/admin/templates", {
        method: "POST",
        body: JSON.stringify({ user_ids, titles, is_mandatory, recurrence })
    });
}
export async function getMyReportData(start, end) {
    return apiFetch(`/tasks/me/report?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
}
