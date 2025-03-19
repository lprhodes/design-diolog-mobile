import React, { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Clock, ArrowLeft } from "lucide-react";
import { MarkdownFile } from "./Layout";
import axios from "axios";

interface FileVersion {
  id: string;
  fileId: string;
  content: string;
  version: number;
  createdAt: Date;
}

interface FileVersionHistoryProps {
  file: MarkdownFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectVersion: (version: FileVersion) => void;
}

const FileVersionHistory = ({
  file,
  isOpen,
  onClose,
  onSelectVersion,
}: FileVersionHistoryProps) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && file) {
      loadVersionHistory(file.id);
    }
  }, [isOpen, file]);

  const loadVersionHistory = async (fileId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/files/${fileId}/versions`);
      setVersions(response.data);
    } catch (error) {
      console.error("Error loading version history:", error);
      setVersions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString();
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History - {file.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-6 text-center">Loading version history...</div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            {versions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No previous versions found
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border rounded-md p-3 hover:bg-accent cursor-pointer"
                    onClick={() => onSelectVersion(version)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        Version {version.version}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(version.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current Version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileVersionHistory;
