import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MarkdownFile } from "./Layout";
import { FileText, Archive, RefreshCw } from "lucide-react";

interface FileSidebarProps {
  files: MarkdownFile[];
  onSelectFile: (file: MarkdownFile) => void;
  onArchiveFile: (fileId: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
}

const FileSidebar = ({
  files,
  onSelectFile,
  onArchiveFile,
  showArchived,
  onToggleArchived,
}: FileSidebarProps) => {
  const activeFiles = files.filter((file) => !file.isArchived);
  const archivedFiles = files.filter((file) => file.isArchived);

  return (
    <div className="h-full border-r bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Files</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleArchived}
          className="flex items-center gap-1"
        >
          {showArchived ? (
            <>
              <FileText className="h-4 w-4" />
              <span>Active</span>
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" />
              <span>Archived</span>
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        {showArchived ? (
          <div className="space-y-1">
            {archivedFiles.length > 0 ? (
              archivedFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onSelect={onSelectFile}
                  onArchive={onArchiveFile}
                  isArchived={true}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm p-2">
                No archived files
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {activeFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onSelect={onSelectFile}
                onArchive={onArchiveFile}
                isArchived={false}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

interface FileItemProps {
  file: MarkdownFile;
  onSelect: (file: MarkdownFile) => void;
  onArchive: (fileId: string) => void;
  isArchived: boolean;
}

const FileItem = ({ file, onSelect, onArchive, isArchived }: FileItemProps) => {
  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      return "Unknown";
    }
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="flex flex-col p-2 rounded-md hover:bg-accent cursor-pointer group"
      onClick={() => onSelect(file)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{file.name}</span>
          {file.version > 1 && (
            <span className="text-xs text-muted-foreground ml-1">
              v{file.version}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isArchived && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(file.id);
              }}
            >
              <Archive className="h-3 w-3" />
            </Button>
          )}

          {isArchived && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                // This would be where you'd implement unarchive functionality
              }}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1 flex flex-col">
        <span>Created: {formatDate(file.createdAt)}</span>
        <span>Updated: {formatDate(file.updatedAt)}</span>
      </div>
    </div>
  );
};

export default FileSidebar;
