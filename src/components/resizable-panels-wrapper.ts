/**
 * This is a wrapper module for react-resizable-panels
 * 
 * It directly imports specific components from react-resizable-panels
 * to avoid star export resolution issues with the default export.
 * 
 * Instead of using star exports, we explicitly import and re-export 
 * each component we need.
 */

// Import specific named exports directly - only including what actually exists in the package
import {
  // Main components
  Panel,
  PanelGroup,
  PanelResizeHandle,
  
  // Types
  type ImperativePanelHandle,
  type PanelProps,
  type PanelGroupProps,
  type PanelResizeHandleProps,
} from 'react-resizable-panels';

// Re-export components (values)
export {
  Panel,
  PanelGroup,
  PanelResizeHandle,
};

// Re-export types properly with the 'export type' syntax for TypeScript isolatedModules
export type {
  ImperativePanelHandle,
  PanelProps,
  PanelGroupProps,
  PanelResizeHandleProps,
};

// DO NOT use a default export here to avoid the same issue
// export default { Panel, PanelGroup, PanelResizeHandle };