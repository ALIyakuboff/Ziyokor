import { io } from "socket.io-client";
let socket = null;
export function initSocket(token) {
    if (socket && socket.connected) {
        return socket;
    }
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    socket = io(API_URL, {
        auth: {
            token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });
    socket.on("connect", () => {
        console.log("[socket] connected to server");
    });
    socket.on("disconnect", (reason) => {
        console.log("[socket] disconnected:", reason);
    });
    socket.on("connect_error", (error) => {
        console.error("[socket] connection error:", error.message);
    });
    return socket;
}
export function getSocket() {
    return socket;
}
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("[socket] disconnected");
    }
}
// Event listener helpers
export function onTaskCreated(callback) {
    socket?.on("task:created", callback);
}
export function onTaskStarted(callback) {
    socket?.on("task:started", callback);
}
export function onTaskCompleted(callback) {
    socket?.on("task:completed", callback);
}
export function onTaskDeleted(callback) {
    socket?.on("task:deleted", callback);
}
export function onTaskCommentAdded(callback) {
    socket?.on("task:comment_added", callback);
}
export function onTaskCommentsUpdated(callback) {
    socket?.on("task:comments_updated", callback);
}
// Cleanup helpers
export function offTaskCreated(callback) {
    socket?.off("task:created", callback);
}
export function offTaskStarted(callback) {
    socket?.off("task:started", callback);
}
export function offTaskCompleted(callback) {
    socket?.off("task:completed", callback);
}
export function offTaskDeleted(callback) {
    socket?.off("task:deleted", callback);
}
export function offTaskCommentAdded(callback) {
    socket?.off("task:comment_added", callback);
}
export function offTaskCommentsUpdated(callback) {
    socket?.off("task:comments_updated", callback);
}
