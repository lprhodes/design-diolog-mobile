import React from 'react';
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from './resizable-panels-wrapper';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">Design Dialog</h1>
      </header>
      
      {/* Main content with resizable panels */}
      <div className="flex-grow overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          <Panel defaultSize={20} minSize={15}>
            <div className="h-full bg-gray-100 p-4 overflow-auto">
              <h2 className="font-bold mb-3">Navigation</h2>
              <ul className="space-y-2">
                <li><a href="/" className="text-blue-600 hover:underline">Home</a></li>
                <li><a href="/debug" className="text-blue-600 hover:underline">Debug</a></li>
                <li><a href="/debug-dashboard" className="text-blue-600 hover:underline">Debug Dashboard</a></li>
                <li><a href="/star-export" className="text-blue-600 hover:underline">Star Export Analyzer</a></li>
              </ul>
            </div>
          </Panel>
          
          {/* Resize handle */}
          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-400 transition-colors" />
          
          {/* Main content */}
          <Panel>
            <div className="h-full overflow-auto p-4">
              {children}
            </div>
          </Panel>
        </PanelGroup>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-200 p-2 text-center text-sm text-gray-600">
        <p>Fixed: Using direct imports instead of star exports to resolve "default binding" error</p>
      </footer>
    </div>
  );
};

export default Layout;
