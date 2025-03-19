import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface CommentFormProps {
  onSubmit?: (comment: string) => void;
  onCancel?: () => void;
  initialValue?: string;
  isReply?: boolean;
  isEditing?: boolean;
  placeholder?: string;
  userName?: string;
}

const CommentForm = ({
  onSubmit = () => {},
  onCancel = () => {},
  initialValue = "",
  isReply = false,
  isEditing = false,
  placeholder = "Add a comment...",
  userName = "Anonymous User",
}: CommentFormProps) => {
  const [comment, setComment] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment("");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarFallback className="text-xs font-medium">
              {userName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={placeholder}
              className="min-h-[80px] w-full resize-none focus:ring-1 focus:ring-primary"
            />

            <div className="mt-3 flex justify-end gap-2">
              {(isReply || isEditing) && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}

              <Button type="submit" disabled={!comment.trim()}>
                {isEditing ? "Update" : isReply ? "Reply" : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
