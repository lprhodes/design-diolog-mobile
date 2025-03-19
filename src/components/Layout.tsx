import React, { useState, useEffect } from "react";
import FileSidebar from "./FileSidebar";
import MarkdownViewer from "./MarkdownViewer";
import CommentPanel from "./CommentPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import axios from "axios";
import { loadMarkdownFile } from "../utils/fileStorage";
import { startWatching, stopWatching } from "../utils/fileWatcher";
import { setupMockApi } from "../api/markdownFiles";

export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Comment {
  id: string;
  text: string;
  userName: string;
  userId: string;
  timestamp: Date;
  replies?: Comment[];
  x?: number;
  y?: number;
  isInline?: boolean;
}

const Layout = () => {
  const [selectedFile, setSelectedFile] = useState<MarkdownFile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [inlineComments, setInlineComments] = useState<Comment[]>([]);
  const [showArchivedFiles, setShowArchivedFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, logout } = useAuth();

  // Initialize the mock API for file operations
  useEffect(() => {
    setupMockApi();
    loadStoredFiles();

    // Start watching for file changes
    startWatching(handleFileChanges);

    return () => {
      stopWatching();
    };
  }, []);

  // Load files from server or initialize with files from public/markdown
  const loadStoredFiles = async () => {
    setIsLoading(true);

    try {
      // Try to load files from server first
      const response = await axios.get("/api/files");
      const storedFiles = response.data;

      if (storedFiles.length === 0) {
        // If no stored files, initialize with default files
        const newFiles = await initializeFilesFromPublic();
        setFiles(newFiles);
      } else {
        setFiles(storedFiles);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      // Fallback to initializing from public directory
      const newFiles = await initializeFilesFromPublic();
      setFiles(newFiles);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize files from the public/markdown directory
  const initializeFilesFromPublic = async () => {
    try {
      const response = await fetch("/api/markdown-files");
      if (!response.ok) {
        throw new Error("Failed to load markdown files");
      }

      const filenames = await response.json();
      const newFiles: MarkdownFile[] = [];

      for (const filename of filenames) {
        const content = await loadMarkdownFile(filename);
        newFiles.push({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          name: filename,
          content,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        });
      }

      // Save the initialized files
      saveFiles(newFiles);
      return newFiles;
    } catch (error) {
      console.error("Error initializing files:", error);
      return [];
    }
  };

  // Handle file changes detected by the watcher
  const handleFileChanges = async (filenames: string[]) => {
    // Get current file names
    const currentFilenames = files.map((file) => file.name);

    // Find new files
    const newFilenames = filenames.filter(
      (name) => !currentFilenames.includes(name),
    );

    if (newFilenames.length > 0) {
      const newFiles: MarkdownFile[] = [];

      for (const filename of newFilenames) {
        const content = await loadMarkdownFile(filename);
        newFiles.push({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          name: filename,
          content,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        });
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      saveFiles(updatedFiles);
    }
  };

  // Load comments when a file is selected
  useEffect(() => {
    if (selectedFile) {
      loadFileComments(selectedFile.id);
      loadInlineComments(selectedFile.id);
    } else {
      setComments([]);
      setInlineComments([]);
    }
  }, [selectedFile]);

  const loadFileComments = async (fileId: string) => {
    try {
      const response = await axios.get(`/api/comments/${fileId}`);
      // Filter out inline comments
      const regularComments = response.data.filter(
        (comment: Comment) => !comment.isInline,
      );
      setComments(regularComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    }
  };

  const loadInlineComments = async (fileId: string) => {
    try {
      const response = await axios.get(`/api/inline-comments/${fileId}`);
      setInlineComments(response.data || []);
    } catch (error) {
      // If the endpoint doesn't exist yet, we'll just use an empty array
      console.error("Error loading inline comments:", error);
      setInlineComments([]);
    }
  };

  const handleFileSelect = (file: MarkdownFile) => {
    setSelectedFile(file);
  };

  const handleArchiveFile = async (fileId: string) => {
    try {
      await axios.put(`/api/files/${fileId}/archive`);

      const updatedFiles = files.map((file) =>
        file.id === fileId ? { ...file, isArchived: true } : file,
      );

      setFiles(updatedFiles);
    } catch (error) {
      console.error("Error archiving file:", error);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!user || !selectedFile) return;

    try {
      const response = await axios.post(`/api/comments/${selectedFile.id}`, {
        text,
        userName: user.name,
        userId: user.id,
        isInline: false,
      });

      const newComment = response.data;
      setComments([...comments, newComment]);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleAddInlineComment = async (text: string, x: number, y: number) => {
    if (!user || !selectedFile) return;

    try {
      const response = await axios.post(
        `/api/inline-comments/${selectedFile.id}`,
        {
          text,
          userName: user.name,
          userId: user.id,
          x,
          y,
          isInline: true,
        },
      );

      const newComment = response.data;
      setInlineComments([...inlineComments, newComment]);
    } catch (error) {
      // If the endpoint doesn't exist yet, we'll mock it
      console.error("Error adding inline comment:", error);
      const newComment: Comment = {
        id: Date.now().toString(),
        text,
        userName: user.name,
        userId: user.id,
        timestamp: new Date(),
        x,
        y,
        isInline: true,
      };
      setInlineComments([...inlineComments, newComment]);
    }
  };

  const handleAddReply = async (parentId: string, text: string) => {
    if (!user || !selectedFile) return;

    try {
      const response = await axios.post(
        `/api/comments/${selectedFile.id}/reply/${parentId}`,
        {
          text,
          userName: user.name,
          userId: user.id,
        },
      );

      const newReply = response.data;

      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }
        return comment;
      });

      setComments(updatedComments);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !selectedFile) return;

    try {
      await axios.delete(`/api/comments/${selectedFile.id}/${commentId}`);
      const updatedComments = comments.filter(
        (comment) => comment.id !== commentId,
      );
      setComments(updatedComments);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!user || !selectedFile) return;

    try {
      await axios.delete(
        `/api/comments/${selectedFile.id}/reply/${commentId}/${replyId}`,
      );

      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: (comment.replies || []).filter(
              (reply) => reply.id !== replyId,
            ),
          };
        }
        return comment;
      });

      setComments(updatedComments);
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const handleDeleteInlineComment = async (commentId: string) => {
    if (!user || !selectedFile) return;

    try {
      await axios.delete(
        `/api/inline-comments/${selectedFile.id}/${commentId}`,
      );
      const updatedComments = inlineComments.filter(
        (comment) => comment.id !== commentId,
      );
      setInlineComments(updatedComments);
    } catch (error) {
      // If the endpoint doesn't exist yet, we'll mock it
      console.error("Error deleting inline comment:", error);
      const updatedComments = inlineComments.filter(
        (comment) => comment.id !== commentId,
      );
      setInlineComments(updatedComments);
    }
  };

  const toggleArchivedFiles = () => {
    setShowArchivedFiles(!showArchivedFiles);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-lg">Loading files...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <div className="w-full bg-card p-2 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold">Markdown Viewer</h1>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-3rem)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <FileSidebar
              files={files}
              onSelectFile={handleFileSelect}
              onArchiveFile={handleArchiveFile}
              showArchived={showArchivedFiles}
              onToggleArchived={toggleArchivedFiles}
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={55}>
            <MarkdownViewer
              file={selectedFile}
              onAddInlineComment={handleAddInlineComment}
              onDeleteInlineComment={handleDeleteInlineComment}
              inlineComments={inlineComments}
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <CommentPanel
              comments={comments}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
              onDeleteReply={handleDeleteReply}
              userName={user?.name || ""}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Layout;
