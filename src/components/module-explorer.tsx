import React, { useEffect, useState } from 'react';

/**
 * This component explores all loaded modules to find potential import issues.
 * It specifically targets problems with star exports and default imports.
 */
const ModuleExplorer = () => {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    console.log('=== MODULE EXPLORER DEBUGGING ===');
    
    // Add results to state for displaying on the page
    const addResult = (message: string) => {
      console.log(message);
      setResults(prev => [...prev, message]);
    };

    // Begin collecting debug information
    addResult('Starting module exploration...');
    
    // Check for Vite specifics (which uses ES modules)
    addResult(`Running in: ${import.meta.env.MODE} mode`);
    
    // Try to detect potential culprits by dynamically importing relevant packages
    const checkPackage = async (packageName: string) => {
      try {
        addResult(`Checking package: ${packageName}...`);
        const module = await import(/* @vite-ignore */ packageName);
        
        addResult(`- Exports from ${packageName}: ${Object.keys(module).join(', ')}`);
        
        // Check if it has a default export
        if ('default' in module) {
          addResult(`- Has default export: ${typeof module.default}`);
        } else {
          addResult('- No default export');
        }
        
        // If this is jwt-decode, examine it more carefully
        if (packageName === 'jwt-decode') {
          if (typeof module.jwtDecode === 'function') {
            addResult('- Found correct named export: jwtDecode function');
          } else {
            addResult('- WARNING: jwtDecode function not found!');
          }
        }
        
        return true;
      } catch (error) {
        addResult(`- Error importing ${packageName}: ${error}`);
        return false;
      }
    };
    
    // Check for specific modules that might be causing issues
    const runChecks = async () => {
      // Check jwt-decode first
      await checkPackage('jwt-decode');
      
      // Check modules that might be re-exporting jwt-decode
      await checkPackage('@react-oauth/google');
      
      // Check if jwt-decode is available as a global
      if (typeof window !== 'undefined') {
        try {
          // @ts-ignore - This is just for debugging
          addResult(`jwt-decode in window: ${typeof window.jwtDecode}`);
        } catch (e) {
          addResult('jwt-decode not available globally');
        }
      }
      
      // Check for module resolution issues by looking at import.meta
      addResult(`import.meta properties: ${Object.keys(import.meta).join(', ')}`);
      
      // Add suggestion for how to fix
      addResult('\nPossible solutions:');
      addResult('1. Update all imports from "import X from jwt-decode" to "import { jwtDecode } from jwt-decode"');
      addResult('2. Check third-party libraries that might be re-exporting jwt-decode');
      addResult('3. Try downgrading jwt-decode to v3.x which had a default export');
    };
    
    runChecks();
  }, []);

  return (
    <div className="p-4 m-4 bg-blue-100 rounded-md">
      <h1 className="text-xl font-bold mb-4">Module Explorer</h1>
      <p className="mb-4">Exploring loaded modules to find import issues</p>
      
      <div className="bg-black text-green-400 p-4 rounded overflow-auto max-h-96 font-mono text-sm">
        {results.map((result, index) => (
          <div key={index} className="mb-1">
            {result.startsWith('-') ? <span className="ml-4">{result}</span> : result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleExplorer;