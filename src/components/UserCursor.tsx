import React from "react";

interface UserCursorProps {
  x: number;
  y: number;
  userName: string;
  color: string;
}

const UserCursor = ({ x, y, userName, color }: UserCursorProps) => {
  return (
    <div
      className="absolute z-50 pointer-events-none flex items-center gap-1"
      style={{ left: x, top: y }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color }}
      >
        <path
          d="M3.5 1.5L12.5 8.5L8.5 9.5L7.5 14.5L3.5 1.5Z"
          fill="currentColor"
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <div
        className="px-2 py-1 rounded text-xs text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {userName}
      </div>
    </div>
  );
};

export default UserCursor;
