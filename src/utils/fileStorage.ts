import { Comment, MarkdownFile } from "../components/Layout";

// Local storage keys
const FILES_KEY = "markdown_files";
const COMMENTS_KEY_PREFIX = "comments_for_";

// Load files from local storage
export const loadFiles = (): MarkdownFile[] => {
  const storedFiles = localStorage.getItem(FILES_KEY);
  return storedFiles ? JSON.parse(storedFiles) : [];
};

// Save files to local storage
export const saveFiles = (files: MarkdownFile[]): void => {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
};

// Load comments for a specific file
export const loadComments = (fileId: string): Comment[] => {
  const storedComments = localStorage.getItem(
    `${COMMENTS_KEY_PREFIX}${fileId}`,
  );
  return storedComments ? JSON.parse(storedComments) : [];
};

// Save comments for a specific file
export const saveComments = (fileId: string, comments: Comment[]): void => {
  localStorage.setItem(
    `${COMMENTS_KEY_PREFIX}${fileId}`,
    JSON.stringify(comments),
  );
};

// Load a file from the public directory
export const loadMarkdownFile = async (filename: string): Promise<string> => {
  try {
    const response = await fetch(`/markdown/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading markdown file: ${filename}`, error);
    return "";
  }
};

// Scan the markdown directory for files
export const scanMarkdownDirectory = async (): Promise<string[]> => {
  try {
    const response = await fetch("/api/markdown-files");
    if (!response.ok) {
      throw new Error("Failed to scan markdown directory");
    }
    return await response.json();
  } catch (error) {
    console.error("Error scanning markdown directory", error);
    return [];
  }
};
