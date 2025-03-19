import React from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface User {
  id: string;
  name: string;
  color: string;
  lastActive: Date;
}

interface UserPresenceProps {
  users: User[];
  currentUserId: string;
}

const UserPresence = ({ users, currentUserId }: UserPresenceProps) => {
  // Filter out current user and sort by most recently active
  const otherUsers = users
    .filter((user) => user.id !== currentUserId)
    .sort(
      (a, b) =>
        new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime(),
    );

  if (otherUsers.length === 0) return null;

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {otherUsers.slice(0, 3).map((user) => (
        <TooltipProvider key={user.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className="border-2 border-background"
                style={{ backgroundColor: user.color }}
              >
                <AvatarFallback className="text-xs font-medium text-white">
                  {user.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{user.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {otherUsers.length > 3 && (
        <Avatar className="border-2 border-background bg-muted">
          <AvatarFallback className="text-xs font-medium">
            +{otherUsers.length - 3}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default UserPresence;
