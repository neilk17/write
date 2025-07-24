import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { extractParentFromFilename, isReplyFile } from "@/lib/dates";

interface FileEntry {
  name: string;
  createdAt: string;
  modifiedAt: string;
  isReply?: boolean;
  parentFile?: string;
  replies?: FileEntry[];
}

interface SearchResult {
  file: FileEntry;
  content: string;
  matchedLine: string;
  lineNumber: number;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFolder: string;
  onSelectEntry?: (name: string) => void;
}

export function SearchDialog({
  open,
  onOpenChange,
  selectedFolder,
  onSelectEntry,
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    if (open && selectedFolder) {
      loadFiles();
    }
  }, [open, selectedFolder]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && files.length > 0) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, files]);

  const loadFiles = async () => {
    try {
      const rawFiles = await window.api.listEntries(selectedFolder);
      const processedFiles = rawFiles.map((file: FileEntry) => ({
        ...file,
        isReply: isReplyFile(file.name),
        parentFile: extractParentFromFilename(file.name),
        replies: [] as FileEntry[],
      }));
      setFiles(processedFiles);
    } catch (e) {
      console.error("Error loading files for search", e);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      for (const file of files) {
        try {
          const content = await window.api.readFile(selectedFolder, file.name);
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
              searchResults.push({
                file,
                content,
                matchedLine: line,
                lineNumber: index + 1,
              });
            }
          });
        } catch (e) {
          console.error(`Error reading file ${file.name}`, e);
        }
      }

      setResults(searchResults);
    } catch (e) {
      console.error("Error performing search", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectEntry?.(result.file.name);
    onOpenChange(false);
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (ts: string) => new Date(ts).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 border-border/50">
        <div className="flex flex-col gap-0 min-h-0">
          <div className="p-4 pb-3">
            <Input
              placeholder="Find or create a note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-0 bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 shadow-none px-0"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 border-t border-border/30">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-sm">Searching...</p>
              </div>
            ) : searchQuery.trim() === "" ? (
              <div className="py-2">
                {files.slice(0, 10).map((file, index) => (
                  <Button
                    key={file.name}
                    variant="ghost"
                    className="w-full h-auto px-4 py-2 text-left flex items-center justify-between rounded-none hover:bg-accent/50"
                    onClick={() => {
                      onSelectEntry?.(file.name);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {file.name.replace('.txt', '')}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-sm">No results found</p>
              </div>
            ) : (
              <div>
                {results.map((result, index) => (
                  <Button
                    key={`${result.file.name}-${index}`}
                    variant="ghost"
                    className="w-full h-auto px-4 py-3 text-left flex flex-col items-start gap-1 rounded-none hover:bg-accent/50"
                    onClick={() => handleSelectResult(result)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">
                        {result.file.name.replace('.txt', '')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Line {result.lineNumber}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 text-left">
                      {result.matchedLine.trim()}
                    </p>
                  </Button>
                ))}
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
