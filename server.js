import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directories exist
const DATA_DIR = join(__dirname, "data");
const COMMENTS_DIR = join(DATA_DIR, "comments");
const VERSIONS_DIR = join(DATA_DIR, "versions");
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(COMMENTS_DIR);
fs.ensureDirSync(VERSIONS_DIR);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(join(__dirname, "dist")));

// API routes
// Get all markdown files
app.get("/api/files", (req, res) => {
  const filesPath = join(DATA_DIR, "files.json");
  if (fs.existsSync(filesPath)) {
    const files = fs.readJsonSync(filesPath);
    res.json(files);
  } else {
    res.json([]);
  }
});

// Get comments for a file
app.get("/api/comments/:fileId", (req, res) => {
  const { fileId } = req.params;
  const commentsPath = join(COMMENTS_DIR, `${fileId}.json`);

  if (fs.existsSync(commentsPath)) {
    const comments = fs.readJsonSync(commentsPath);
    res.json(comments);
  } else {
    res.json([]);
  }
});

// Add a comment
app.post("/api/comments/:fileId", (req, res) => {
  const { fileId } = req.params;
  const { text, userName, userId } = req.body;

  if (!text || !userName || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const commentsPath = join(COMMENTS_DIR, `${fileId}.json`);
  let comments = [];

  if (fs.existsSync(commentsPath)) {
    comments = fs.readJsonSync(commentsPath);
  }

  const newComment = {
    id: Date.now().toString(),
    text,
    userName,
    userId,
    timestamp: new Date(),
    replies: [],
  };

  comments.push(newComment);
  fs.writeJsonSync(commentsPath, comments);

  res.status(201).json(newComment);
});

// Add a reply
app.post("/api/comments/:fileId/reply/:commentId", (req, res) => {
  const { fileId, commentId } = req.params;
  const { text, userName, userId } = req.body;

  if (!text || !userName || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const commentsPath = join(COMMENTS_DIR, `${fileId}.json`);

  if (!fs.existsSync(commentsPath)) {
    return res.status(404).json({ error: "Comments file not found" });
  }

  const comments = fs.readJsonSync(commentsPath);

  const newReply = {
    id: Date.now().toString(),
    text,
    userName,
    userId,
    timestamp: new Date(),
  };

  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      };
    }
    return comment;
  });

  fs.writeJsonSync(commentsPath, updatedComments);

  res.status(201).json(newReply);
});

// Archive a file
app.put("/api/files/:fileId/archive", (req, res) => {
  const { fileId } = req.params;
  const filesPath = join(DATA_DIR, "files.json");

  if (!fs.existsSync(filesPath)) {
    return res.status(404).json({ error: "Files not found" });
  }

  const files = fs.readJsonSync(filesPath);

  const updatedFiles = files.map((file) => {
    if (file.id === fileId) {
      return { ...file, isArchived: true };
    }
    return file;
  });

  fs.writeJsonSync(filesPath, updatedFiles);

  res.json({ success: true });
});

// Get version history for a file
app.get("/api/files/:fileId/versions", (req, res) => {
  const { fileId } = req.params;
  const fileVersionsDir = join(VERSIONS_DIR, fileId);

  if (!fs.existsSync(fileVersionsDir)) {
    return res.json([]);
  }

  try {
    const versionFiles = fs.readdirSync(fileVersionsDir);
    const versions = [];

    for (const versionFile of versionFiles) {
      const versionPath = join(fileVersionsDir, versionFile);
      const version = fs.readJsonSync(versionPath);
      versions.push(version);
    }

    // Sort by version number in descending order (newest first)
    versions.sort((a, b) => b.version - a.version);

    res.json(versions);
  } catch (error) {
    console.error("Error fetching file versions:", error);
    res.status(500).json({ error: "Failed to fetch file versions" });
  }
});

// Update a file's content
app.put("/api/files/:fileId/content", (req, res) => {
  const { fileId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const filesPath = join(DATA_DIR, "files.json");

  if (!fs.existsSync(filesPath)) {
    return res.status(404).json({ error: "Files not found" });
  }

  const files = fs.readJsonSync(filesPath);
  const fileToUpdate = files.find((file) => file.id === fileId);

  if (!fileToUpdate) {
    return res.status(404).json({ error: "File not found" });
  }

  // Create a new version record
  const fileVersionsDir = join(VERSIONS_DIR, fileId);
  fs.ensureDirSync(fileVersionsDir);

  const versionId = Date.now().toString();
  const versionPath = join(fileVersionsDir, `${versionId}.json`);

  fs.writeJsonSync(versionPath, {
    id: versionId,
    fileId,
    content: fileToUpdate.content,
    version: fileToUpdate.version,
    createdAt: fileToUpdate.updatedAt,
  });

  // Update the file
  const updatedFiles = files.map((file) => {
    if (file.id === fileId) {
      return {
        ...file,
        content,
        updatedAt: new Date(),
        version: file.version + 1,
      };
    }
    return file;
  });

  fs.writeJsonSync(filesPath, updatedFiles);

  res.json({ success: true });
});

// All other GET requests not handled before will return the React app
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
