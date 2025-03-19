import React, { useState } from "react";
import { Comment } from "./Layout";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import CommentForm from "./CommentForm";
import { useAuth } from "../context/AuthContext";

interface CommentThreadProps {
  comment: Comment;
  onAddReply: (text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onDeleteReply?: (commentId: string, replyId: string) => void;
  userName: string;
}

const CommentThread = ({
  comment,
  onAddReply,
  onDeleteComment,
  onDeleteReply,
  userName,
}: CommentThreadProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useAuth();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleReplySubmit = (text: string) => {
    onAddReply(text);
    setIsReplying(false);
  };

  const canDeleteComment = user?.id === comment.userId && onDeleteComment;

  return (
    <div className="space-y-3">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarFallback className="text-xs font-medium">
              {comment.userName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{comment.userName}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDate(comment.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {canDeleteComment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive/80"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-sm">{comment.text}</p>
            </div>
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="ml-8">
          <CommentForm
            onSubmit={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
            isReply={true}
            placeholder="Write a reply..."
            userName={userName || "Anonymous User"}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-3">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-7 w-7 bg-primary/10">
                  <AvatarFallback className="text-xs font-medium">
                    {reply.userName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{reply.userName}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(reply.timestamp)}
                      </span>
                    </div>

                    {user?.id === reply.userId && onDeleteReply && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 text-destructive hover:text-destructive/80"
                        onClick={() => onDeleteReply(comment.id, reply.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-2">
                    <p className="text-sm">{reply.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
