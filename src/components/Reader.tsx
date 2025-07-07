import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createReplyFilename,
  extractParentFromFilename,
  isReplyFile,
} from "../lib/dates";
import { Button } from "./ui/button";

const extensions = [StarterKit];

interface TiptapReplyProps {
  content: string;
  onUpdate: (content: string) => void;
}

function TiptapReply({ content, onUpdate }: TiptapReplyProps) {
  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getText());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap placeholder:text-muted-foreground field-sizing-content min-h-32 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      if (content === "") {
        editor.commands.setContent("");
      }
      editor.commands.focus();
    }
  }, [content, editor]);

  return <EditorContent editor={editor} />;
}

interface FileEntry {
  name: string;
  createdAt: string;
  modifiedAt: string;
  isReply?: boolean;
  parentFile?: string;
  replies?: FileEntry[];
}

interface ReplyItemProps {
  reply: FileEntry;
  currentPath: string;
  formatDateTime: (
    timestamp: string,
    format?: "full" | "date-only" | "time-only"
  ) => string;
}

function ReplyItem({ reply, currentPath, formatDateTime }: ReplyItemProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadReplyContent = async () => {
      try {
        const replyContent = await window.api.readFile(currentPath, reply.name);
        setContent(replyContent);
        setLoading(false);
      } catch (error) {
        console.error("Error loading reply content:", error);
        setLoading(false);
      }
    };
    loadReplyContent();
  }, [reply.name, currentPath]);

  if (loading) {
    return (
      <div className="p-3 bg-background border rounded-lg">Loading...</div>
    );
  }

  return (
    <div className="p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-muted-foreground">
          {formatDateTime(reply.createdAt, "full")}
        </span>
      </div>
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}

interface JournalEntriesProps {
  selectedFolder: string;
  initialEntry?: string | null;
}

function JournalEntries({ selectedFolder, initialEntry }: JournalEntriesProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [entryContent, setEntryContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isWritingReply, setIsWritingReply] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState<string>("");

  useEffect(() => {
    if (selectedFolder) {
      setCurrentPath(selectedFolder);
      loadEntries(selectedFolder);
    }
  }, [selectedFolder]);

  useEffect(() => {
    if (initialEntry && entries.length > 0) {
      setSelectedEntry(initialEntry);
      loadEntryContent(initialEntry);
    }
  }, [initialEntry, entries]);

  useEffect(() => {
    if (selectedEntry) {
      loadEntryContent(selectedEntry);
    }
  }, [selectedEntry]);

  const loadEntries = async (folderPath: string) => {
    setLoading(true);
    try {
      const files = await window.api.listEntries(folderPath);

      // Process files to identify parent-child relationships
      const processedFiles = files.map((file) => ({
        ...file,
        isReply: isReplyFile(file.name),
        parentFile: extractParentFromFilename(file.name),
        replies: [] as FileEntry[],
      }));

      // Group replies with their parents
      const parentFiles = processedFiles.filter((f) => !f.isReply);
      const replyFiles = processedFiles.filter((f) => f.isReply);

      // Attach replies to their parent files
      parentFiles.forEach((parent) => {
        parent.replies = replyFiles.filter(
          (reply) => reply.parentFile === parent.name
        );
      });

      // Sort entries by creation time (newest first)
      const sortedEntries = parentFiles.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setEntries(sortedEntries);

      setLoading(false);
    } catch (error) {
      console.error("Error loading entries:", error);
      setLoading(false);
    }
  };

  const loadEntryContent = async (filename: string) => {
    try {
      // Find the entry (could be a parent or a reply)
      let entry = entries.find((e) => e.name === filename);
      let parentEntry = entry;

      // If it's a reply file, find its parent
      if (!entry) {
        for (const parent of entries) {
          const replyEntry = parent.replies?.find((r) => r.name === filename);
          if (replyEntry) {
            entry = replyEntry;
            parentEntry = parent;
            break;
          }
        }
      }

      if (entry && parentEntry) {
        const content = await window.api.readFile(currentPath, filename);
        setEntryContent(content);
        setSelectedEntry(parentEntry.name); // Always set to parent for UI consistency
      }
    } catch (error) {
      console.error("Error loading entry content:", error);
    }
  };

  const handleReply = () => {
    setIsWritingReply(true);
    setReplyContent("");
  };

  const handleSaveReply = async () => {
    if (selectedEntry && replyContent.trim()) {
      try {
        const replyFilename = createReplyFilename(selectedEntry);
        const success = await window.api.saveFile(
          currentPath,
          replyFilename,
          replyContent
        );
        if (success) {
          setIsWritingReply(false);
          setReplyContent("");
          // Reload entries to show the new reply
          await loadEntries(currentPath);
        }
      } catch (error) {
        console.error("Error saving reply:", error);
      }
    }
  };

  const handleCancelReply = () => {
    setReplyContent("");
    setIsWritingReply(false);
  };

  const formatDateTime = (
    timestamp: string,
    format: "full" | "date-only" | "time-only" = "full"
  ): string => {
    try {
      // Handle undefined or null timestamps
      if (!timestamp) {
        console.error("Empty timestamp received:", timestamp);
        return "Unknown date";
      }

      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date created from timestamp:", timestamp);
        return "Unknown date";
      }

      if (format === "date-only") {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else if (format === "time-only") {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error with date";
    }
  };

  return (
    <div className="journal-entries h-full flex flex-col">
      {loading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="pl-4 w-full overflow-y-auto max-h-[calc(100vh-120px)]">
            <div className="max-w-3xl mx-auto px-6">
            {selectedEntry ? (
              <div>
                {(() => {
                  const currentEntry = entries.find(
                    (e) => e.name === selectedEntry
                  );

                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg">
                        <div className="whitespace-pre-wrap">
                          {entryContent}
                        </div>
                      </div>

                      {currentEntry?.replies &&
                        currentEntry.replies.length > 0 && (
                          <div className="border-t space-y-3">
                            {currentEntry.replies
                              .sort(
                                (a, b) =>
                                  new Date(a.createdAt).getTime() -
                                  new Date(b.createdAt).getTime()
                              )
                              .map((reply) => (
                                <ReplyItem
                                  key={reply.name}
                                  reply={reply}
                                  currentPath={currentPath}
                                  formatDateTime={formatDateTime}
                                />
                              ))}
                          </div>
                        )}

                      {!isWritingReply && (
                        <div>
                          <Button
                            onClick={handleReply}
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground"
                          >
                            Add a comment...
                          </Button>
                        </div>
                      )}

                      {isWritingReply && (
                        <div className="border-t pt-4 mt-6">
                          <TiptapReply
                            content={replyContent}
                            onUpdate={setReplyContent}
                          />
                          <div className="flex gap-2 mt-4">
                            <Button onClick={handleSaveReply} size="sm">
                              Save
                            </Button>
                            <Button
                              onClick={handleCancelReply}
                              size="sm"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-500">Select a file to view its content</p>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Reader({ selectedFolder, initialEntry }: JournalEntriesProps) {
  return <JournalEntries selectedFolder={selectedFolder} initialEntry={initialEntry} />;
}
