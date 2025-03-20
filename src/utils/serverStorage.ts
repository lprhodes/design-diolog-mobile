import fs from "fs-extra";
import path from "path";
import { Comment, MarkdownFile, FileVersion } from "../types";

// Server-side storage paths
const DATA_DIR = path.join(process.cwd(), "data");
const FILES_PATH = path.join(DATA_DIR, "files.json");
export const COMMENTS_DIR = path.join(DATA_DIR, "comments");
const VERSIONS_DIR = path.join(DATA_DIR, "versions");

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(COMMENTS_DIR);
fs.ensureDirSync(VERSIONS_DIR);

// Load files from server storage
export const loadFiles = async (): Promise<MarkdownFile[]> => {
  try {
    if (fs.existsSync(FILES_PATH)) {
      const data = await fs.readFile(FILES_PATH, "utf8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error loading files from server:", error);
    return [];
  }
};

// Save files to server storage
export const saveFiles = async (files: MarkdownFile[]): Promise<void> => {
  try {
    await fs.writeFile(FILES_PATH, JSON.stringify(files, null, 2));
  } catch (error) {
    console.error("Error saving files to server:", error);
  }
};

// Load comments for a specific file
export const loadComments = async (fileId: string): Promise<Comment[]> => {
  try {
    const commentsPath = path.join(COMMENTS_DIR, `${fileId}.json`);
    if (fs.existsSync(commentsPath)) {
      const data = await fs.readFile(commentsPath, "utf8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error loading comments for file ${fileId}:`, error);
    return [];
  }
};

// Save comments for a specific file
export const saveComments = async (
  fileId: string,
  comments: Comment[],
): Promise<void> => {
  try {
    const commentsPath = path.join(COMMENTS_DIR, `${fileId}.json`);
    await fs.writeFile(commentsPath, JSON.stringify(comments, null, 2));
  } catch (error) {
    console.error(`Error saving comments for file ${fileId}:`, error);
  }
};

// Load version history for a specific file
export const loadFileVersions = async (
  fileId: string,
): Promise<FileVersion[]> => {
  try {
    const fileVersionsDir = path.join(VERSIONS_DIR, fileId);
    if (!fs.existsSync(fileVersionsDir)) {
      return [];
    }

    const versionFiles = await fs.readdir(fileVersionsDir);
    const versions: FileVersion[] = [];

    for (const versionFile of versionFiles) {
      const versionPath = path.join(fileVersionsDir, versionFile);
      const data = await fs.readFile(versionPath, "utf8");
      const version = JSON.parse(data);
      versions.push(version);
    }

    // Sort by version number in descending order (newest first)
    return versions.sort((a, b) => b.version - a.version);
  } catch (error) {
    console.error(`Error loading versions for file ${fileId}:`, error);
    return [];
  }
};

// Save a version of a file
export const saveFileVersion = async (version: FileVersion): Promise<void> => {
  try {
    const fileVersionsDir = path.join(VERSIONS_DIR, version.fileId);
    await fs.ensureDir(fileVersionsDir);

    const versionPath = path.join(fileVersionsDir, `${version.id}.json`);
    await fs.writeFile(versionPath, JSON.stringify(version, null, 2));
  } catch (error) {
    console.error(`Error saving version for file ${version.fileId}:`, error);
  }
};
