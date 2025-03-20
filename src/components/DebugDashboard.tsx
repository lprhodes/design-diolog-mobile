import React from 'react';
import { DebugImports } from './debug-imports';
import { ResizablePanelsDebug } from './ResizablePanelsDebug';

export const DebugDashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Import Debugging Dashboard</h1>
      <p className="mb-4 text-gray-700">This dashboard contains components to help diagnose import issues</p>
      
      <div className="grid gap-4">
        {/* Show the React Resizable Panels specific debug component */}
        <div>
          <h2 className="text-xl font-semibold mb-2">React Resizable Panels Debug</h2>
          <ResizablePanelsDebug />
        </div>
        
        {/* Show the general debug imports component */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">General Import Debugging</h2>
          <DebugImports />
        </div>
        
        {/* Environment information */}
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Information</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="font-semibold">Build Mode:</dt>
            <dd>{import.meta.env.MODE}</dd>
            
            <dt className="font-semibold">Vite Base URL:</dt>
            <dd>{import.meta.env.BASE_URL}</dd>
            
            <dt className="font-semibold">Development:</dt>
            <dd>{import.meta.env.DEV ? 'Yes' : 'No'}</dd>
            
            <dt className="font-semibold">Production:</dt>
            <dd>{import.meta.env.PROD ? 'Yes' : 'No'}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default DebugDashboard;