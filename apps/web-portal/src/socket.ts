import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initSocket(token: string): Socket {
    if (socket && socket.connected) {
        return socket;
    }

    let API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
    if (API_URL && !API_URL.startsWith("http")) API_URL = `https://${API_URL}`;
    // If API_URL is empty string, io() will use window.location
    console.log("[socket] Initializing with API_URL:", API_URL || "window.location");

    socket = io(API_URL, {
        auth: {
            token
        },
        transports: ["polling", "websocket"], // Enable polling for better reliability on Render
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 20 // Increase attempts for resilience
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

export function getSocket(): Socket | null {
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
export function onTaskCreated(callback: (data: any) => void) {
    socket?.on("task:created", callback);
}

export function onTaskStarted(callback: (data: any) => void) {
    socket?.on("task:started", callback);
}

export function onTaskCompleted(callback: (data: any) => void) {
    socket?.on("task:completed", callback);
}

export function onTaskDeleted(callback: (data: any) => void) {
    socket?.on("task:deleted", callback);
}

export function onTaskUpdated(callback: (data: any) => void) {
    socket?.on("task:updated", callback);
}

export function onTaskCommentAdded(callback: (data: any) => void) {
    socket?.on("task:comment_added", callback);
}

export function onTaskCommentsUpdated(callback: (data: any) => void) {
    socket?.on("task:comments_updated", callback);
}

// Cleanup helpers
export function offTaskCreated(callback: (data: any) => void) {
    socket?.off("task:created", callback);
}

export function offTaskStarted(callback: (data: any) => void) {
    socket?.off("task:started", callback);
}

export function offTaskCompleted(callback: (data: any) => void) {
    socket?.off("task:completed", callback);
}

export function offTaskDeleted(callback: (data: any) => void) {
    socket?.off("task:deleted", callback);
}

export function offTaskUpdated(callback: (data: any) => void) {
    socket?.off("task:updated", callback);
}

export function offTaskCommentAdded(callback: (data: any) => void) {
    socket?.off("task:comment_added", callback);
}

export function offTaskCommentsUpdated(callback: (data: any) => void) {
    socket?.off("task:comments_updated", callback);
}
