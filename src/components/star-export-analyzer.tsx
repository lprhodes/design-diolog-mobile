import React, { useState, useEffect } from 'react';

// This component specifically focuses on diagnosing star export issues
export const StarExportAnalyzer = () => {
  const [analysis, setAnalysis] = useState<{
    complete: boolean;
    error?: string;
    modules: Record<string, {
      attempted: boolean;
      hasDefaultExport: boolean;
      namedExports: string[];
      error?: string;
    }>;
  }>({
    complete: false,
    modules: {}
  });

  useEffect(() => {
    const analyzePotentialIssueModules = async () => {
      // List of modules that might be using star exports and could be problematic
      const modulesToTest = [
        'react-resizable-panels',
        // If we need to test other modules, add them here
      ];

      const results: Record<string, any> = {};

      // Test each module
      for (const moduleName of modulesToTest) {
        console.log(`--- Analyzing module: ${moduleName} ---`);
        
        try {
          results[moduleName] = { attempted: true };
          
          // Attempt dynamic import
          const module = await import(moduleName);
          
          // Check for default export
          const hasDefaultExport = 'default' in module;
          results[moduleName].hasDefaultExport = hasDefaultExport;
          
          // Get named exports
          const namedExports = Object.keys(module).filter(key => key !== 'default');
          results[moduleName].namedExports = namedExports;
          
          console.log(`Module ${moduleName}:`, {
            hasDefaultExport,
            namedExportCount: namedExports.length,
            namedExports: namedExports.slice(0, 10) // Log first 10 to avoid console spam
          });
          
          // Special test for the specific error about default and star exports
          if (hasDefaultExport) {
            try {
              // This is a simplified test to try to manually access what might be causing the error
              console.log(`Default export type: ${typeof module.default}`);
              const defaultValue = module.default;
              console.log('Default export can be accessed directly:', !!defaultValue);
            } catch (err) {
              console.error(`Error accessing default export of ${moduleName}:`, err);
              results[moduleName].error = `Error accessing default: ${err?.message || 'Unknown error'}`;
            }
          }
        } catch (error) {
          console.error(`Failed to analyze ${moduleName}:`, error);
          results[moduleName] = {
            attempted: true,
            error: error?.message || 'Unknown error'
          };
        }
      }

      // Second phase: Test specifically for re-exported symbols
      console.log('--- Testing for re-exported symbols ---');
      for (const moduleName of modulesToTest) {
        if (!results[moduleName]?.namedExports) continue;
        
        try {
          // Try to individually import some exports to see if they work
          // This can help identify if the issue is with specific re-exports
          const sampleExports = results[moduleName].namedExports.slice(0, 3);
          
          for (const exportName of sampleExports) {
            try {
              // Using dynamic import with named import syntax
              const importStatement = `import { ${exportName} } from '${moduleName}';`;
              console.log(`Testing named import: ${importStatement}`);
              
              // We can't eval this directly, but we can simulate by accessing the module
              const module = await import(moduleName);
              const exportValue = module[exportName];
              console.log(`Export '${exportName}' type:`, typeof exportValue);
            } catch (err) {
              console.error(`Error importing named export '${exportName}' from ${moduleName}:`, err);
            }
          }
        } catch (error) {
          console.error(`Failed testing named exports for ${moduleName}:`, error);
        }
      }

      setAnalysis({
        complete: true,
        modules: results
      });
    };

    analyzePotentialIssueModules();
  }, []);

  return (
    <div className="p-4 m-4 bg-orange-100 border-2 border-orange-400 rounded-lg">
      <h2 className="text-xl font-bold text-orange-800">Star Export Analysis</h2>
      <p className="text-sm text-orange-700 mb-4">
        Diagnosing "Importing binding name 'default' cannot be resolved by star export entries" error
      </p>
      
      {!analysis.complete ? (
        <div className="animate-pulse">Analyzing modules...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(analysis.modules).map(([moduleName, info]) => (
            <div key={moduleName} className="p-3 bg-white rounded shadow-sm">
              <h3 className="font-bold">{moduleName}</h3>
              
              {info.error ? (
                <div className="text-red-600 mt-1">Error: {info.error}</div>
              ) : (
                <div className="mt-1 space-y-1 text-sm">
                  <p>Has default export: <span className="font-mono">{info.hasDefaultExport ? 'Yes' : 'No'}</span></p>
                  <p>Named exports: <span className="font-mono">{info.namedExports?.length || 0}</span></p>
                  
                  {info.namedExports && info.namedExports.length > 0 && (
                    <div>
                      <p className="font-semibold mt-2">Export names (first 10):</p>
                      <ul className="list-disc list-inside pl-2 font-mono text-xs">
                        {info.namedExports.slice(0, 10).map(name => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Note: See browser console for detailed analysis logs</p>
            <p className="mt-1 text-xs">
              This tool attempts to diagnose the specific "default binding and star export" error by examining
              module exports and import behavior
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarExportAnalyzer;