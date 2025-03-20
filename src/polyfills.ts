// This file contains polyfills for browser environment
// It should be imported before any other code in main.tsx

// Process polyfill
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  // Create minimal process.env polyfill
  (window as any).process = {
    env: {
      NODE_ENV: import.meta.env.MODE,
      // Add any other environment variables your app needs
      VITE_BASE_PATH: import.meta.env.VITE_BASE_PATH || "/",
      TEMPO: import.meta.env.TEMPO || false,
    },
  };
  
  console.log('Process polyfill applied:', (window as any).process);
}

export {}; // This makes the file a module