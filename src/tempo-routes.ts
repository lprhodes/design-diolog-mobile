import { RouteObject } from "react-router-dom";
import React from "react";

// Import all storyboards dynamically
const routes: RouteObject[] = [
  {
    path: "/tempobook/*",
    children: [
      {
        path: "storyboards/:id",
        async lazy() {
          // Use dynamic import for storyboards
          const id = window.location.pathname.split("/").pop();
          try {
            const module = await import(
              `./tempobook/storyboards/${id}/index.tsx`
            );
            return { Component: module.default };
          } catch (error) {
            console.error(`Error loading storyboard ${id}:`, error);
            return {
              Component: () =>
                React.createElement("div", null, "Error loading storyboard"),
            };
          }
        },
      },
    ],
  },
];

export default routes;
