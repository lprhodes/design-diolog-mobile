import React, { useEffect } from 'react';

// Try different import patterns for jwt-decode
// Method 1: Try named import (most likely the correct approach for v4)
import { jwtDecode } from 'jwt-decode';

// Method 2: Try namespace import
import * as JwtDecodeLib from 'jwt-decode';

const JwtDebugComponent = () => {
  useEffect(() => {
    console.log('JWT Debug Component Mounted');
    
    // Log the imported values
    console.log('Named import jwtDecode:', jwtDecode);
    console.log('Namespace import JwtDecodeLib:', JwtDecodeLib);
    
    // Create a sample JWT for testing
    const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    try {
      // Try decoding with the named import
      const decodedNamed = jwtDecode(sampleJwt);
      console.log('Successfully decoded with named import:', decodedNamed);
    } catch (error) {
      console.error('Error using named import:', error);
    }
    
    try {
      // Try with namespace import - if there's a default export
      // JWT-decode v4 doesn't have a default export, only named exports
      if (typeof JwtDecodeLib.jwtDecode === 'function') {
        const decodedNamedFromNamespace = JwtDecodeLib.jwtDecode(sampleJwt);
        console.log('Successfully decoded with named import from namespace:', decodedNamedFromNamespace);
      } else {
        console.log('No jwtDecode named export found in namespace');
      }
    } catch (error) {
      console.error('Error using namespace import:', error);
    }
    
    // List all available exports
    console.log('All exports from JwtDecodeLib:', Object.keys(JwtDecodeLib));
    
    // Log Vite environment information
    console.log('Vite environment:', import.meta.env);
    console.log('Vite mode:', import.meta.env.MODE);
  }, []);

  return (
    <div className="p-4 m-4 bg-yellow-100 rounded-md">
      <h1 className="text-xl font-bold">JWT-Decode Debug Component</h1>
      <p>Please check the console for jwt-decode import debugging information.</p>
    </div>
  );
};

export default JwtDebugComponent;