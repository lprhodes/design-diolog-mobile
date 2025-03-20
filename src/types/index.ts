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
  isInline?: boolean;
  x?: number;
  y?: number;
}

export interface FileVersion {
  id: string;
  fileId: string;
  content: string;
  version: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
