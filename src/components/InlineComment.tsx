import React, { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MessageSquare, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Comment } from "./Layout";

interface InlineCommentProps {
  comment: Comment;
  onDelete: (commentId: string) => void;
}

const InlineComment = ({ comment, onDelete }: InlineCommentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const canDelete = user?.id === comment.userId;

  return (
    <div className="absolute z-40" style={{ top: comment.y, left: comment.x }}>
      {isExpanded ? (
        <div className="bg-white border shadow-md rounded-md p-3 w-64">
          <div className="flex items-start gap-2">
            <Avatar className="h-6 w-6 bg-primary/10">
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
                <span className="text-sm font-medium">{comment.userName}</span>
                <div className="flex items-center gap-1">
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive/80"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsExpanded(false)}
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              </div>
              <p className="text-sm mt-1">{comment.text}</p>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(comment.timestamp)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 inline-comment-marker"
          onClick={() => setIsExpanded(true)}
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default InlineComment;
