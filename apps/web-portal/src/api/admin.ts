import { apiFetch } from "./client";

export type Worker = { id: string; full_name: string };

export type Task = {
    id: string;
    title: string;
    is_mandatory: boolean;
    status: "pending" | "in_progress" | "done" | "missed";
    assigned_date: string;
    visible_date: string;
    is_carryover: boolean;
    comment_count?: number;
};

export type DayGroup = {
    mandatory: Task[];
    normal: Task[];
    carryover: Task[];
    progress: { done: number; total: number; percent: number };
};

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

export type AnalyticsPoint = { label: string; value: number };
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
    return apiFetch<AnalyticsResp>(`/admin/analytics${q}`);
}

export async function createOneOffMandatoryTask(userId: string, title: string, date: string) {
    return apiFetch<any>("/admin/mandatory/one-off", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, title, date })
    });
}

export async function getTaskComments(taskId: string) {
    return apiFetch<{ items: string[] }>(`/tasks/${taskId}/comments`);
}

export async function deactivateWorker(workerId: string) {
    return apiFetch<any>(`/admin/workers/${workerId}/deactivate`, {
        method: "PATCH"
    });
}

export async function deleteTaskAdmin(taskId: string) {
    return apiFetch<any>(`/admin/tasks/${taskId}`, {
        method: "DELETE"
    });
}

export async function hardDeleteWorker(workerId: string) {
    return apiFetch<any>(`/admin/workers/${workerId}`, {
        method: "DELETE"
    });
}

export async function getFullReportData(start: string, end: string) {
    return apiFetch<{ start: string; end: string; data: { worker_name: string; tasks: Task[] }[] }>(
        `/admin/reports/full?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
}
