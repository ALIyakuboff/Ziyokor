export function listWorkers(): Promise<any>;
export function createWorker(full_name: string, phone_login: string): Promise<any>;
export function createProjectTask(userId: string, title: string, date: string): Promise<any>;
export function getWorkerWeek(workerId: string, anchor?: string): Promise<any>;
export function createOneOffMandatoryTask(userId: string, title: string, date: string): Promise<any>;
export function deactivateWorker(workerId: string): Promise<any>;

export function getMyWeek(anchor?: string): Promise<any>;
export function createMyTask(title: string, date?: string): Promise<any>;
export function startTask(id: string): Promise<any>;
export function doneTask(id: string): Promise<any>;
export function updateTaskStatus(id: string, status: string): Promise<any>;
export function deleteTask(id: string): Promise<any>;

export function getTaskComments(taskId: string): Promise<any>;
export function addComment(taskId: string, items: string[]): Promise<any>;
export function replaceComments(taskId: string, items: string[]): Promise<any>;
export function getAnalytics(range: string, anchor: string, workerId?: string): Promise<any>;
export function createRecurringTemplate(user_ids: string[], titles: string[], is_mandatory?: boolean, recurrence?: string): Promise<any>;
export function getMyReportData(start: string, end: string): Promise<any>;
