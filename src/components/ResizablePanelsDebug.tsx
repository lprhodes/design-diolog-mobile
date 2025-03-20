import React from 'react';

// This component focuses on debugging import issues with react-resizable-panels
export const ResizablePanelsDebug = () => {
  const [importInfo, setImportInfo] = React.useState<Record<string, any>>({
    status: 'loading',
    error: null,
    exports: {}
  });

  // Run detailed debugging for the imports
  React.useEffect(() => {
    const debugImports = async () => {
      try {
        // 1. First attempt - Try dynamic import with named exports only
        console.log('--- DEBUG: IMPORT ATTEMPT 1 - DYNAMIC IMPORT ---');
        const module = await import('react-resizable-panels');
        
        // Log all module keys and check their types
        const exportDetails: Record<string, any> = {};
        Object.keys(module).forEach(key => {
          try {
            const value = module[key];
            // Check if it's a Symbol and handle it specially
            const isSymbol = typeof value === 'symbol';
            exportDetails[key] = {
              type: typeof value,
              isSymbol,
              stringValue: isSymbol ? 'Symbol (cannot convert to string)' : String(value).substring(0, 100)
            };
            
            console.log(`Export key [${key}]:`, {
              type: typeof value,
              isSymbol,
              value: isSymbol ? 'Symbol (cannot convert to string)' : value
            });
          } catch (error) {
            console.error(`Error examining export [${key}]:`, error);
            exportDetails[key] = { error: error?.message || 'Unknown error' };
          }
        });

        // 2. Second attempt - Try CommonJS-style require if available
        console.log('--- DEBUG: IMPORT ATTEMPT 2 - ALTERNATIVE PATHS ---');
        try {
          // Check if we're getting the expected exports
          console.log('Panel export type:', typeof module.Panel);
          console.log('PanelGroup export type:', typeof module.PanelGroup);
          console.log('PanelResizeHandle export type:', typeof module.PanelResizeHandle);
        } catch (err) {
          console.error('Error accessing expected exports:', err);
        }

        // Update component state with our findings
        setImportInfo({
          status: 'success',
          exports: exportDetails,
          defaultExport: 'default' in module ? 'exists' : 'missing',
          panelExport: 'Panel' in module ? 'exists' : 'missing'
        });
      } catch (error) {
        console.error('Import debugging failed:', error);
        setImportInfo({
          status: 'error',
          error: error?.message || 'Unknown error',
          exports: {}
        });
      }
    };

    // Run the debug process
    debugImports();
  }, []);

  return (
    <div className="bg-yellow-100 p-4 m-4 rounded border-2 border-yellow-500">
      <h2 className="text-lg font-bold text-yellow-800">react-resizable-panels Import Diagnostics</h2>
      <div className="mt-2 text-sm">
        <p>Status: <span className={importInfo.status === 'error' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
          {importInfo.status}
        </span></p>
        
        {importInfo.status === 'error' && (
          <div className="mt-1 text-red-600">
            Error: {importInfo.error}
          </div>
        )}
        
        {importInfo.status === 'success' && (
          <div className="mt-2">
            <p>Default export: <span className="font-mono">{importInfo.defaultExport}</span></p>
            <p>Panel export: <span className="font-mono">{importInfo.panelExport}</span></p>
            <div className="mt-2">
              <p className="font-bold">Export Details (check console for full info):</p>
              <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-auto max-h-40">
                {JSON.stringify(importInfo.exports, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <p className="mt-3 text-xs italic">See browser console for detailed diagnostics</p>
      </div>
    </div>
  );
};

export default ResizablePanelsDebug;