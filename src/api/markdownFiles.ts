// This file simulates a server API for file operations
// In a real application, this would be a server endpoint

// Simulated file list (in a real app, this would come from the server)
let cachedFiles: string[] = ["README.md", "CONTRIBUTING.md", "ARCHIVED.md"];

// Simulate an API endpoint to get markdown files
export const getMarkdownFiles = async (): Promise<string[]> => {
  // In a real application, this would make an actual API call
  // For now, we'll just return our cached list
  return Promise.resolve(cachedFiles);
};

// Mock function to add a file to our simulated file system
export const addMockFile = (filename: string): void => {
  if (!cachedFiles.includes(filename)) {
    cachedFiles = [...cachedFiles, filename];
  }
};

// Setup a mock API endpoint
export const setupMockApi = (): void => {
  // Create a mock fetch handler for '/api/markdown-files'
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (input === "/api/markdown-files") {
      return new Response(JSON.stringify(cachedFiles), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // For all other requests, use the original fetch
    return originalFetch(input, init);
  };
};
