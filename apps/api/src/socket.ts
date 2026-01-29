import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { query } from "./db";

let io: SocketIOServer | null = null;

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}

export function initSocketServer(httpServer: HttpServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
            credentials: true
        }
    });

    // Authentication middleware
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const secret = process.env.JWT_SECRET || "dev_secret";
            const decoded = jwt.verify(token, secret) as { sub: string };

            // Verify user exists and get role
            const userResult = await query<{ id: string; role: string }>(
                "SELECT id, role FROM users WHERE id=$1 AND is_active=true LIMIT 1",
                [decoded.sub]
            );

            if (!userResult.rows.length) {
                console.warn(`[socket] User not found in DB but token valid. ID: ${decoded.sub}`);
                // Temporary fallback for debugging:
                socket.userId = decoded.sub;
                socket.userRole = "worker"; // Default assumption or try to extract from token if available
                return next();
            }

            const user = userResult.rows[0];
            socket.userId = user.id;
            socket.userRole = user.role;

            next();
        } catch (error) {
            console.error("[socket] auth error:", error);
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`[socket] client connected: ${socket.id} (user: ${socket.userId}, role: ${socket.userRole})`);

        // Join user-specific room
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
            console.log(`[socket] user ${socket.userId} joined room: user:${socket.userId}`);
        }

        // Join role-specific room
        if (socket.userRole) {
            socket.join(`role:${socket.userRole}`);
            console.log(`[socket] user ${socket.userId} joined room: role:${socket.userRole}`);
        }

        socket.on("disconnect", () => {
            console.log(`[socket] client disconnected: ${socket.id}`);
        });
    });

    console.log("[socket] Socket.IO server initialized");
    return io;
}

export function getSocketServer(): SocketIOServer | null {
    return io;
}

// Helper functions to emit events
export function emitToUser(userId: string, event: string, data: any) {
    if (!io) {
        console.warn("[socket] Socket.IO not initialized");
        return;
    }
    io.to(`user:${userId}`).emit(event, data);
    console.log(`[socket] emitted ${event} to user:${userId}`);
}

export function emitToRole(role: string, event: string, data: any) {
    if (!io) {
        console.warn("[socket] Socket.IO not initialized");
        return;
    }
    io.to(`role:${role}`).emit(event, data);
    console.log(`[socket] emitted ${event} to role:${role}`);
}

export function emitToAll(event: string, data: any) {
    if (!io) {
        console.warn("[socket] Socket.IO not initialized");
        return;
    }
    io.emit(event, data);
    console.log(`[socket] emitted ${event} to all clients`);
}
