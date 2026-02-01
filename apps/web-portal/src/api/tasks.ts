import { apiFetch } from "./client";

export type Worker = { id: string; full_name: string; phone_login?: string };

export type Task = {
    id: string;
    user_id: string;
    title: string;
    is_mandatory: boolean;
    status: "pending" | "in_progress" | "done" | "missed";
    assigned_date: string;
    visible_date: string;
    is_carryover: boolean;
    carryover_from_date: string | null;
    started_at: string | null;
    completed_date: string | null;
    comment_count?: number;
};

export type DayGroup = {
    mandatory: Task[];
    normal: Task[];
    carryover: Task[];
    progress: { done: number; total: number; percent: number };
};

// --- Admin APIs ---

export async function listWorkers() {
    return apiFetch<{ workers: Worker[] }>("/admin/workers");
}

export async function createWorker(full_name: string, phone_login: string) {
    return apiFetch<{ worker: any; initial_password_last4: string }>("/admin/workers", {
        method: "POST",
        body: JSON.stringify({ full_name, phone_login })
    });
}

export async function getWorkerWeek(workerId: string, anchor?: string) {
    const q = anchor ? `?anchor=${encodeURIComponent(anchor)}` : "";
    return apiFetch<{ worker: Worker; days: string[]; data: Record<string, DayGroup> }>(`/admin/workers/${workerId}/week${q}`);
}

export async function createOneOffMandatoryTask(userId: string, title: string, date: string) {
    return apiFetch<any>("/admin/mandatory/one-off", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, title, date })
    });
}

export async function deactivateWorker(workerId: string) {
    return apiFetch<any>(`/admin/workers/${workerId}/deactivate`, {
        method: "PATCH"
    });
}

export async function createProjectTask(userId: string, title: string, date: string) {
    return apiFetch<{ task: Task }>("/admin/project-task", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, title, date })
    });
}

// --- Worker APIs ---

export async function getMyWeek(anchor?: string) {
    const q = anchor ? `?anchor=${encodeURIComponent(anchor)}` : "";
    return apiFetch<{ anchor: string; days: string[]; data: Record<string, DayGroup> }>(`/tasks/me/week${q}`);
}

export async function createMyTask(title: string, date?: string) {
    return apiFetch<{ task: Task }>(`/tasks/me`, {
        method: "POST",
        body: JSON.stringify({ title, date })
    });
}

export async function startTask(id: string) {
    return apiFetch<{ task: Task }>(`/tasks/${id}/start`, { method: "PATCH" });
}

export async function doneTask(id: string) {
    return apiFetch<{ task: Task }>(`/tasks/${id}/done`, { method: "PATCH" });
}

export async function updateTaskStatus(id: string, status: string) {
    return apiFetch<{ task: Task }>(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    });
}

export async function deleteTask(id: string) {
    return apiFetch<{ ok: boolean }>(`/tasks/${id}`, { method: "DELETE" });
}

// --- Shared APIs (Comments & Analytics) ---

export async function getTaskComments(taskId: string) {
    return apiFetch<{ items: string[] }>(`/tasks/${taskId}/comments`);
}

export async function addComment(taskId: string, items: string[]) {
    return apiFetch<{ comment: any }>(`/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ items })
    });
}

export async function replaceComments(taskId: string, items: string[]) {
    return apiFetch<{ comment: any }>(`/tasks/${taskId}/comments`, {
        method: "PUT",
        body: JSON.stringify({ items })
    });
}

export type AnalyticsResp = {
    range: string;
    anchor: string;
    series: {
        label: string;
        completion_rate: number;
        mandatory_compliance: number;
    }[];
    totals: any;
};

export async function getAnalytics(range: "week" | "month" | "year", anchor: string, workerId?: string) {
    const q = `?range=${range}&anchor=${encodeURIComponent(anchor)}${workerId ? `&workerId=${encodeURIComponent(workerId)}` : ""}`;
    // Consistency: we use the robust admin/analytics endpoint which now handles worker-level permission isolation
    return apiFetch<AnalyticsResp>(`/admin/analytics${q}`);
}

export async function createRecurringTemplate(user_ids: string[], titles: string[], is_mandatory: boolean = true, recurrence: "daily" = "daily") {
    return apiFetch<{ ok: boolean; created: number }>("/admin/templates", {
        method: "POST",
        body: JSON.stringify({ user_ids, titles, is_mandatory, recurrence })
    });
}

export async function getMyReportData(start: string, end: string) {
    return apiFetch<any>(`/tasks/me/report?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
}
