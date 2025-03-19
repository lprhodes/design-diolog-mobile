import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { MarkdownFile, Comment } from "./Layout";
import { Clock, Calendar, Users } from "lucide-react";
import FileVersionHistory from "./FileVersionHistory";
import HoverComment from "./HoverComment";
import InlineComment from "./InlineComment";
import UserCursor from "./UserCursor";
import UserPresence from "./UserPresence";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../utils/websocketService";

interface MarkdownViewerProps {
  file: MarkdownFile | null;
  onAddInlineComment?: (text: string, x: number, y: number) => void;
  onDeleteInlineComment?: (commentId: string) => void;
  inlineComments?: Comment[];
}

interface FileVersion {
  id: string;
  fileId: string;
  content: string;
  version: number;
  createdAt: Date;
}

interface CursorPosition {
  x: number;
  y: number;
}

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  position: CursorPosition;
  lastActive: Date;
}

const MarkdownViewer = ({
  file,
  onAddInlineComment,
  onDeleteInlineComment,
  inlineComments = [],
}: MarkdownViewerProps) => {
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);
  const [viewingVersion, setViewingVersion] = useState<FileVersion | null>(
    null,
  );
  const [hoverPosition, setHoverPosition] = useState<CursorPosition | null>(
    null,
  );
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Initialize WebSocket connection if user is authenticated
  const wsService =
    user && file ? useWebSocket(user.id, user.name, file.id) : null;

  // Track mouse movement for cursor sharing
  useEffect(() => {
    if (!wsService || !contentRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!contentRef.current) return;

      const rect = contentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only send updates every 50ms to reduce network traffic
      if (wsService) {
        wsService.updateCursorPosition(x, y);
      }
    };

    // Subscribe to cursor position updates from other users
    const handleCursorUpdates = (users: ActiveUser[]) => {
      setActiveUsers(users.filter((u) => u.id !== user?.id));
    };

    if (wsService) {
      wsService.on("cursor_positions", handleCursorUpdates);
      wsService.on("user_presence", handleCursorUpdates);
    }

    contentRef.current.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("mousemove", handleMouseMove);
      }
      if (wsService) {
        wsService.off("cursor_positions", handleCursorUpdates);
        wsService.off("user_presence", handleCursorUpdates);
      }
    };
  }, [wsService, user, contentRef.current]);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-500">
            No file selected
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a file from the sidebar to view its content
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      return "Unknown";
    }
    return new Date(date).toLocaleString();
  };

  const handleSelectVersion = (version: FileVersion) => {
    setViewingVersion(version);
    setShowVersionHistory(false);
  };

  const handleBackToCurrent = () => {
    setViewingVersion(null);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    if (!user || !onAddInlineComment) return;

    // Don't trigger if we're clicking on an existing comment or UI element
    if ((e.target as HTMLElement).closest(".inline-comment-marker")) {
      return;
    }

    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverPosition({ x, y });
    setIsAddingComment(true);
  };

  const handleAddInlineComment = (text: string, x: number, y: number) => {
    if (onAddInlineComment) {
      onAddInlineComment(text, x, y);
    }
    setIsAddingComment(false);
    setHoverPosition(null);
  };

  const handleCancelComment = () => {
    setIsAddingComment(false);
    setHoverPosition(null);
  };

  const content = viewingVersion ? viewingVersion.content : file.content;
  const isViewingOldVersion = viewingVersion !== null;

  // This is a simplified markdown renderer
  // In a real application, you would use a library like react-markdown
  // with plugins for mermaid and SVG support
  const renderMarkdown = (content: string) => {
    // Split the content by lines
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeBlockContent = "";
    let codeBlockType = "";

    return lines
      .map((line, index) => {
        // Handle code blocks
        if (line.startsWith("```")) {
          if (!inCodeBlock) {
            inCodeBlock = true;
            codeBlockType = line.slice(3).trim();
            codeBlockContent = "";
            return null;
          } else {
            inCodeBlock = false;
            const content = codeBlockContent;
            const type = codeBlockType;

            // Reset for next code block
            codeBlockContent = "";
            codeBlockType = "";

            // Render based on type
            if (type === "mermaid") {
              return (
                <div
                  key={index}
                  className="my-4 p-4 bg-gray-50 rounded-md border"
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    Mermaid Diagram
                  </div>
                  <pre className="text-sm">{content}</pre>
                </div>
              );
            }

            return (
              <pre
                key={index}
                className="my-4 p-4 bg-gray-50 rounded-md border overflow-x-auto"
              >
                <code>{content}</code>
              </pre>
            );
          }
        }

        // Collect content inside code block
        if (inCodeBlock) {
          codeBlockContent += line + "\n";
          return null;
        }

        // Handle headings
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-3xl font-bold mt-6 mb-4">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-semibold mt-5 mb-3">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl font-semibold mt-4 mb-2">
              {line.slice(4)}
            </h3>
          );
        }

        // Handle lists
        if (line.startsWith("- ")) {
          return (
            <li key={index} className="ml-6 list-disc">
              {line.slice(2)}
            </li>
          );
        }
        if (line.startsWith("1. ")) {
          return (
            <li key={index} className="ml-6 list-decimal">
              {line.slice(3)}
            </li>
          );
        }

        // Handle images
        if (line.includes("![") && line.includes("](") && line.includes(")")) {
          const altStart = line.indexOf("![") + 2;
          const altEnd = line.indexOf("](");
          const urlStart = altEnd + 2;
          const urlEnd = line.indexOf(")", urlStart);

          const alt = line.substring(altStart, altEnd);
          const url = line.substring(urlStart, urlEnd);

          return (
            <div key={index} className="my-4">
              <img
                src={url}
                alt={alt}
                className="max-w-full h-auto rounded-md"
              />
            </div>
          );
        }

        // Handle empty lines
        if (line.trim() === "") {
          return <div key={index} className="h-4"></div>;
        }

        // Default paragraph
        return (
          <p key={index} className="my-2">
            {line}
          </p>
        );
      })
      .filter(Boolean);
  };

  // Get active users for this file
  const otherActiveUsers = activeUsers.filter((u) => u.id !== user?.id);

  return (
    <div className="h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{file.name}</h2>
            {otherActiveUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <UserPresence
                  users={otherActiveUsers.map((u) => ({
                    id: u.id,
                    name: u.name,
                    color: u.color,
                    lastActive: u.lastActive,
                  }))}
                  currentUserId={user?.id || ""}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(true)}
              className="flex items-center gap-1"
            >
              <Clock className="h-4 w-4" />
              <span>History</span>
            </Button>
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Created: {formatDate(file.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatDate(file.updatedAt)}</span>
          </div>
          {file.version > 1 && (
            <div>
              <span>Version: {file.version}</span>
            </div>
          )}
          {otherActiveUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {otherActiveUsers.length} active user
                {otherActiveUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {file.isArchived && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
            Archived
          </span>
        )}
        {isViewingOldVersion && (
          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md flex justify-between items-center">
            <span className="text-sm">
              Viewing version {viewingVersion.version} from{" "}
              {formatDate(viewingVersion.createdAt)}
            </span>
            <Button size="sm" variant="outline" onClick={handleBackToCurrent}>
              Back to Current
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div
          className="p-6 relative"
          style={{ width: "800px", margin: "0 auto" }}
          ref={contentRef}
          onClick={handleContentClick}
        >
          {renderMarkdown(content)}

          {/* Render inline comments */}
          {inlineComments.map((comment) => (
            <InlineComment
              key={comment.id}
              comment={comment}
              onDelete={onDeleteInlineComment || (() => {})}
            />
          ))}

          {/* Render other users' cursors */}
          {otherActiveUsers.map((user) => (
            <UserCursor
              key={user.id}
              x={user.position.x}
              y={user.position.y}
              userName={user.name}
              color={user.color}
            />
          ))}

          {/* Render comment form at hover position */}
          {isAddingComment && hoverPosition && (
            <HoverComment
              x={hoverPosition.x}
              y={hoverPosition.y}
              onSubmit={handleAddInlineComment}
              onCancel={handleCancelComment}
            />
          )}
        </div>
      </ScrollArea>

      <FileVersionHistory
        file={file}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        onSelectVersion={handleSelectVersion}
      />
    </div>
  );
};

export default MarkdownViewer;
