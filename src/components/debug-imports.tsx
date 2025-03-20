import React from 'react';

// Import libraries using different import patterns
// We'll console.log the results to see what's available in each import pattern
export const DebugImports = () => {
  // Debug imports
  React.useEffect(() => {
    // Try different import patterns directly in the component
    import('react-resizable-panels')
      .then(module => {
        console.log('Dynamic import - full module:', module);
        
        // Check what exports are available
        for (const key in module) {
          try {
            console.log(`Module export [${key}]:`, module[key]);
          } catch (err) {
            console.error(`Error accessing export [${key}]:`, err);
          }
        }
        
        // Try to access Panel export
        try {
          console.log('Panel component:', module.Panel);
        } catch (err) {
          console.error('Error accessing Panel:', err);
        }
      })
      .catch(err => {
        console.error('Error dynamically importing react-resizable-panels:', err);
      });
      
    // Also log information about the current environment
    console.log('import.meta:', import.meta);
    console.log('import.meta.env:', import.meta.env);
    console.log('Vite environment mode:', import.meta.env.MODE);
    
  }, []);

  return (
    <div className="bg-red-100 p-4 m-4 rounded">
      <h2 className="text-lg font-bold">Import Debugging</h2>
      <p>Check browser console for import debugging information</p>
    </div>
  );
};

export default DebugImports;