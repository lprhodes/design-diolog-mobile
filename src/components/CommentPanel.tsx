import React, { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";
import { Comment } from "./Layout";

interface CommentPanelProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onAddReply: (parentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  userName: string;
}

const CommentPanel = ({
  comments,
  onAddComment,
  onAddReply,
  onDeleteComment,
  onDeleteReply,
  userName,
}: CommentPanelProps) => {
  return (
    <div className="h-full border-l bg-gray-50 flex flex-col">
      <div className="p-4 border-b bg-card">
        <h2 className="text-xl font-semibold">Comments</h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="p-4 space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  onAddReply={(text) => onAddReply(comment.id, text)}
                  onDeleteComment={onDeleteComment}
                  onDeleteReply={onDeleteReply}
                  userName={userName}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to add a comment
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t bg-card">
        <CommentForm
          onSubmit={onAddComment}
          placeholder="Add a comment..."
          userName={userName || "Anonymous User"}
        />
      </div>
    </div>
  );
};

export default CommentPanel;
