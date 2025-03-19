import { useEffect, useRef } from "react";

type CursorPosition = {
  x: number;
  y: number;
};

type UserPresence = {
  userId: string;
  userName: string;
  fileId: string;
  position: CursorPosition;
  color: string;
  lastActive: Date;
};

type InlineComment = {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  text: string;
  x: number;
  y: number;
  timestamp: Date;
};

type WebSocketMessage = {
  type:
    | "cursor_move"
    | "user_joined"
    | "user_left"
    | "inline_comment"
    | "delete_comment";
  data: any;
};

// Mock implementation for demo purposes
// In a real app, this would connect to a WebSocket server
class WebSocketService {
  private static instance: WebSocketService;
  private mockConnected: boolean = false;
  private mockUsers: Map<string, UserPresence> = new Map();
  private mockComments: Map<string, InlineComment[]> = new Map();
  private callbacks: Map<string, Function[]> = new Map();
  private userColor: string = "";
  private userId: string = "";
  private userName: string = "";
  private currentFileId: string = "";

  private constructor() {
    // Generate a random color for this user
    this.userColor = this.getRandomColor();

    // Simulate periodic cleanup of inactive users
    setInterval(() => this.cleanupInactiveUsers(), 30000);
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private getRandomColor(): string {
    const colors = [
      "#F44336",
      "#E91E63",
      "#9C27B0",
      "#673AB7",
      "#3F51B5",
      "#2196F3",
      "#03A9F4",
      "#00BCD4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#CDDC39",
      "#FFC107",
      "#FF9800",
      "#FF5722",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public connect(userId: string, userName: string, fileId: string): void {
    if (this.mockConnected) return;

    this.mockConnected = true;
    this.userId = userId;
    this.userName = userName;
    this.currentFileId = fileId;

    // Add this user to the presence list
    this.mockUsers.set(userId, {
      userId,
      userName,
      fileId,
      position: { x: 0, y: 0 },
      color: this.userColor,
      lastActive: new Date(),
    });

    // Notify about user joining
    this.notifyCallbacks("user_presence", Array.from(this.mockUsers.values()));

    // Load existing comments for this file
    const comments = this.mockComments.get(fileId) || [];
    this.notifyCallbacks("inline_comments", comments);

    console.log(
      `WebSocket connected for user ${userName} (${userId}) on file ${fileId}`,
    );
  }

  public disconnect(): void {
    if (!this.mockConnected) return;

    // Remove this user from the presence list
    this.mockUsers.delete(this.userId);

    // Notify about user leaving
    this.notifyCallbacks("user_presence", Array.from(this.mockUsers.values()));

    this.mockConnected = false;
    console.log(`WebSocket disconnected for user ${this.userName}`);
  }

  public updateCursorPosition(x: number, y: number): void {
    if (!this.mockConnected) return;

    const user = this.mockUsers.get(this.userId);
    if (user) {
      user.position = { x, y };
      user.lastActive = new Date();
      this.mockUsers.set(this.userId, user);

      // Notify about cursor movement
      this.notifyCallbacks(
        "cursor_positions",
        Array.from(this.mockUsers.values()),
      );
    }
  }

  public addInlineComment(text: string, x: number, y: number): string {
    if (!this.mockConnected) return "";

    const commentId = Date.now().toString();
    const comment: InlineComment = {
      id: commentId,
      fileId: this.currentFileId,
      userId: this.userId,
      userName: this.userName,
      text,
      x,
      y,
      timestamp: new Date(),
    };

    // Add to comments for this file
    const fileComments = this.mockComments.get(this.currentFileId) || [];
    fileComments.push(comment);
    this.mockComments.set(this.currentFileId, fileComments);

    // Notify about new comment
    this.notifyCallbacks("inline_comments", fileComments);

    return commentId;
  }

  public deleteInlineComment(commentId: string): void {
    if (!this.mockConnected) return;

    const fileComments = this.mockComments.get(this.currentFileId) || [];
    const updatedComments = fileComments.filter(
      (comment) => comment.id !== commentId,
    );

    if (updatedComments.length !== fileComments.length) {
      this.mockComments.set(this.currentFileId, updatedComments);

      // Notify about deleted comment
      this.notifyCallbacks("inline_comments", updatedComments);
    }
  }

  public getInlineComments(fileId: string): InlineComment[] {
    return this.mockComments.get(fileId) || [];
  }

  public getActiveUsers(): UserPresence[] {
    return Array.from(this.mockUsers.values());
  }

  public on(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.push(callback);
    this.callbacks.set(event, callbacks);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.callbacks.set(event, callbacks);
    }
  }

  private notifyCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  private cleanupInactiveUsers(): void {
    const now = new Date().getTime();
    let hasChanges = false;

    // Remove users inactive for more than 5 minutes
    this.mockUsers.forEach((user, userId) => {
      const lastActive = new Date(user.lastActive).getTime();
      if (now - lastActive > 5 * 60 * 1000) {
        this.mockUsers.delete(userId);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.notifyCallbacks(
        "user_presence",
        Array.from(this.mockUsers.values()),
      );
    }
  }

  public getUserColor(): string {
    return this.userColor;
  }
}

// React hook for using the WebSocket service
export const useWebSocket = (
  userId: string,
  userName: string,
  fileId: string,
) => {
  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    if (userId && userName && fileId) {
      wsService.connect(userId, userName, fileId);

      return () => {
        wsService.disconnect();
      };
    }
  }, [userId, userName, fileId]);

  return wsService;
};

export default WebSocketService;
