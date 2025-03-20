import express from "express";
import fs from "fs-extra";
import path from "path";
import {
  loadFiles,
  saveFiles,
  loadComments,
  saveComments,
  loadFileVersions,
  saveFileVersion,
  COMMENTS_DIR,
} from "../utils/serverStorage";
import { Comment, MarkdownFile } from "../components/Layout";

const app = express();
app.use(express.json());

// API endpoint to get all markdown files
app.get("/api/files", async (req, res) => {
  try {
    const files = await loadFiles();
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// API endpoint to get comments for a specific file
app.get("/api/comments/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const comments = await loadComments(fileId);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// API endpoint to add a comment to a file
app.post("/api/comments/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { text, userName, userId, isInline, x, y } = req.body;

    if (!text || !userName || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const comments = await loadComments(fileId);
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      userName,
      userId,
      timestamp: new Date(),
      replies: [],
      isInline: isInline || false,
      x,
      y
    };

    comments.push(newComment);
    await saveComments(fileId, comments);

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// API endpoint to add an inline comment to a file
app.post("/api/inline-comments/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { text, userName, userId, x, y } = req.body;

    if (!text || !userName || !userId || x === undefined || y === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // We'll store inline comments in a separate collection
    const commentsPath = path.join(COMMENTS_DIR, `${fileId}_inline.json`);
    let comments = [];

    if (fs.existsSync(commentsPath)) {
      const data = await fs.readFile(commentsPath, "utf8");
      comments = JSON.parse(data);
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      userName,
      userId,
      timestamp: new Date(),
      isInline: true,
      x,
      y
    };

    comments.push(newComment);
    await fs.writeFile(commentsPath, JSON.stringify(comments, null, 2));

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding inline comment:", error);
    res.status(500).json({ error: "Failed to add inline comment" });
  }
});

// API endpoint to get inline comments for a file
app.get("/api/inline-comments/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const commentsPath = path.join(COMMENTS_DIR, `${fileId}_inline.json`);

    if (fs.existsSync(commentsPath)) {
      const data = await fs.readFile(commentsPath, "utf8");
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching inline comments:", error);
    res.status(500).json({ error: "Failed to fetch inline comments" });
  }
});

// API endpoint to delete a comment
app.delete("/api/comments/:fileId/:commentId", async (req, res) => {
  try {
    const { fileId, commentId } = req.params;
    const comments = await loadComments(fileId);
    
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    
    if (updatedComments.length === comments.length) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    await saveComments(fileId, updatedComments);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// API endpoint to add a reply to a comment
app.post("/api/comments/:fileId/reply/:commentId", async (req, res) => {
  try {
    const { fileId, commentId } = req.params;
    const { text, userName, userId } = req.body;

    if (!text || !userName || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const comments = await loadComments(fileId);
    const newReply: Comment = {
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

    await saveComments(fileId, updatedComments);

    res.status(201).json(newReply);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: "Failed to add reply" });
  }
});

// API endpoint to delete a reply
app.delete("/api/comments/:fileId/reply/:commentId/:replyId", async (req, res) => {
  try {
    const { fileId, commentId, replyId } = req.params;
    const comments = await loadComments(fileId);
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: (comment.replies || []).filter(reply => reply.id !== replyId)
        };
      }
      return comment;
    });
    
    await saveComments(fileId, updatedComments);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ error: "Failed to delete reply" });
  }
});

// API endpoint to delete an inline comment
app.delete("/api/inline-comments/:fileId/:commentId", async (req, res) => {
  try {
    const { fileId, commentId } = req.params;
    const commentsPath = path.join(COMMENTS_DIR, `${fileId}_inline.json`);
    
    if (fs.existsSync(commentsPath)) {
      const data = await fs.readFile(commentsPath, "utf8");
      const comments = JSON.parse(data);
      
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      await fs.writeFile(commentsPath, JSON.stringify(updatedComments, null, 2));
      
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Comments file not found" });
    }
  } catch (error) {
    console.error("Error deleting inline comment:", error);
    res.status(500).json({ error: "Failed to delete inline comment" });
  }
});

// API endpoint to archive a file
app.put("/api/files/:fileId/archive", async (req, res) => {
  try {
    const { fileId } = req.params;
    const files = await loadFiles();

    const updatedFiles = files.map((file) => {
      if (file.id === fileId) {
        return { ...file, isArchived: true };
      }
      return file;
    });

    await saveFiles(updatedFiles);

    res.json({ success: true });
  } catch (error) {
    console.error("Error archiving file:", error);
    res.status(500).json({ error: "Failed to archive file" });
  }
});

// API endpoint to get version history for a file
app.get("/api/files/:fileId/versions", async (req, res) => {
  try {
    const { fileId } = req.params;
    const versions = await loadFileVersions(fileId);
    res.json(versions);
  } catch (error) {
    console.error("Error fetching file versions:", error);
    res.status(500).json({ error: "Failed to fetch file versions" });
  }
});

// API endpoint to update a file's content
app.put("/api/files/:fileId/content", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const files = await loadFiles();
    const fileToUpdate = files.find((file) => file.id === fileId);

    if (!fileToUpdate) {
      return res.status(404).json({ error: "File not found" });
    }

    // Create a new version record
    await saveFileVersion({
      id: Date.now().toString(),
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

    await saveFiles(updatedFiles);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating file content:", error);
    res.status(500).json({ error: "Failed to update file content" });
  }
});

// API endpoint to save files
app.post("/api/files", async (req, res) => {
  try {
    const files: MarkdownFile[] = req.body;
    await saveFiles(files);
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving files:", error);
    res.status(500).json({ error: "Failed to save files" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
