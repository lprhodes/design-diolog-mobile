// This is a client-side implementation that simulates file watching
// In a real application, this would be handled by a server

let watchInterval: number | null = null;
let lastKnownFiles: string[] = [];

type FileChangeCallback = (files: string[]) => void;

// Start watching for file changes
export const startWatching = (
  callback: FileChangeCallback,
  intervalMs = 5000,
): void => {
  if (watchInterval) {
    stopWatching();
  }

  // Initial check
  checkForChanges(callback);

  // Set up interval for periodic checks
  watchInterval = window.setInterval(() => {
    checkForChanges(callback);
  }, intervalMs);
};

// Stop watching for file changes
export const stopWatching = (): void => {
  if (watchInterval) {
    window.clearInterval(watchInterval);
    watchInterval = null;
  }
};

// Check for changes in the markdown directory
const checkForChanges = async (callback: FileChangeCallback): Promise<void> => {
  try {
    const response = await fetch("/api/markdown-files");
    if (!response.ok) {
      throw new Error("Failed to check for file changes");
    }

    const currentFiles = await response.json();

    // Check if the files have changed
    if (JSON.stringify(currentFiles) !== JSON.stringify(lastKnownFiles)) {
      lastKnownFiles = currentFiles;
      callback(currentFiles);
    }
  } catch (error) {
    console.error("Error checking for file changes", error);
  }
};
