import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HoverCommentProps {
  x: number;
  y: number;
  onSubmit: (text: string, x: number, y: number) => void;
  onCancel: () => void;
}

const HoverComment = ({ x, y, onSubmit, onCancel }: HoverCommentProps) => {
  const [text, setText] = useState("");
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, x, y);
      setText("");
    }
  };

  return (
    <div
      className="absolute bg-white border shadow-lg rounded-md p-3 w-64 z-50"
      style={{ top: y + 20, left: x }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          Add comment as {user?.name || "Anonymous"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add your comment..."
          className="min-h-[80px] mb-2"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!text.trim()}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HoverComment;
