import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

// Explicit import of everything needed directly from the package
import { Panel as ResizablePanel } from "react-resizable-panels";
import { PanelGroup as ResizablePanelGroup } from "react-resizable-panels";
import { PanelResizeHandle as ResizableHandle } from "react-resizable-panels";
import type { PanelProps, PanelGroupProps, PanelResizeHandleProps } from "react-resizable-panels";

// Wrapper component with explicit typing
const CustomPanelGroup: React.FC<PanelGroupProps & { className?: string }> = ({
  className,
  ...props
}) => {
  return (
    <ResizablePanelGroup
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
};

// Wrapper component with explicit typing
const CustomPanelHandle: React.FC<
  PanelResizeHandleProps & {
    withHandle?: boolean;
    className?: string;
  }
> = ({ withHandle, className, ...props }) => {
  return (
    <ResizableHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <DragHandleDots2Icon className="h-2.5 w-2.5" />
        </div>
      )}
    </ResizableHandle>
  );
};

// Export with renamed identifiers to avoid namespace conflicts
export {
  CustomPanelGroup as ResizablePanelGroup,
  ResizablePanel,
  CustomPanelHandle as ResizableHandle,
};