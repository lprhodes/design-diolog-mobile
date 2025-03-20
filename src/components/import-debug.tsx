import React, { useEffect } from 'react';

// Import debugging component - this will help identify module resolution issues
const ImportDebugComponent = () => {
  useEffect(() => {
    console.log('--- IMPORT DEBUGGING STARTED ---');
    
    // Test dynamic imports for jwt-decode
    import('jwt-decode')
      .then(module => {
        console.log('Dynamic import of jwt-decode successful:', module);
        console.log('Available exports:', Object.keys(module));
        
        // Check if jwtDecode function exists
        if (typeof module.jwtDecode === 'function') {
          console.log('jwtDecode function found in exports');
          
          // Test the function with a sample token
          const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
          try {
            const decoded = module.jwtDecode(sampleToken);
            console.log('Token decoded successfully:', decoded);
          } catch (err) {
            console.error('Error decoding token:', err);
          }
        } else {
          console.error('jwtDecode function NOT found in module exports');
        }
        
        // Check if the module has a default export (should not in v4)
        if ('default' in module) {
          console.log('WARNING: module has unexpected default export:', (module as any).default);
        }
      })
      .catch(err => {
        console.error('Error dynamically importing jwt-decode:', err);
      });
    
    // Import verification for other dependencies that might be causing issues
    // Test react-resizable-panels which had similar issues
    import('react-resizable-panels')
      .then(module => {
        console.log('react-resizable-panels module:', module);
        console.log('Available exports in react-resizable-panels:', Object.keys(module));
      })
      .catch(err => {
        console.error('Error importing react-resizable-panels:', err);
      });
      
    // Add verification for Vite environment
    console.log('Vite env mode:', import.meta.env.MODE);
    console.log('Vite env type:', typeof import.meta.env);
    
    // Log info about module resolution
    console.log('import.meta full object:', import.meta);
    
  }, []);

  return (
    <div className="p-4 m-4 bg-green-100 rounded-md">
      <h1 className="text-xl font-bold">Module Import Debug</h1>
      <p>This component tests various import strategies to debug module resolution issues</p>
      <p>Please check the browser console for detailed debugging information</p>
    </div>
  );
};

export default ImportDebugComponent;