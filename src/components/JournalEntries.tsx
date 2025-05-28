import { useState, useEffect } from "react";

interface FileEntry {
  name: string;
  modifiedTime: string;
}

interface GroupedEntries {
  [date: string]: FileEntry[];
}

function JournalEntries({ selectedFolder }: { selectedFolder: string }) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>({});
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [entryContent, setEntryContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if (selectedFolder) {
      setCurrentPath(selectedFolder);
      loadEntries(selectedFolder);
    }
  }, [selectedFolder]);

  const loadEntries = async (folderPath: string) => {
    setLoading(true);
    try {
      const files = await window.api.listEntries(folderPath);

      // Sort entries by modification time (newest first)
      const sortedEntries = [...files].sort((a, b) => {
        return (
          new Date(b.modifiedTime).getTime() -
          new Date(a.modifiedTime).getTime()
        );
      });

      setEntries(sortedEntries);

      // Group entries by date
      if (sortedEntries.length > 0) {
        const grouped = groupEntriesByDate(sortedEntries);
        setGroupedEntries(grouped);
      } else {
        setGroupedEntries({});
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading entries:", error);
      setLoading(false);
    }
  };

  const groupEntriesByDate = (entries: FileEntry[]): GroupedEntries => {
    const grouped: GroupedEntries = {};

    entries.forEach((entry) => {
      const dateStr = formatDateTime(entry.modifiedTime, "date-only");
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(entry);
    });

    return grouped;
  };

  const loadEntryContent = async (filename: string) => {
    try {
      const entry = entries.find((e) => e.name === filename);
      if (entry) {
        const content = await window.api.readFile(currentPath, filename);
        setEntryContent(content);
        setSelectedEntry(entry.name);
      }
    } catch (error) {
      console.error("Error loading entry content:", error);
    }
  };

  const formatDateTime = (
    timestamp: string,
    format: "full" | "date-only" | "time-only" = "full"
  ): string => {
    try {
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
          <div className="w-1/3 pr-4 border-r overflow-y-auto max-h-[calc(100vh-120px)]">
            {Object.keys(groupedEntries).length === 0 ? (
              <p>No entries found</p>
            ) : (
              <div className="space-y-4">
                {Object.keys(groupedEntries)
                  .filter((key) => key !== "directories")
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                  .map((dateKey) => (
                    <div key={dateKey} className="mb-4">
                      <h3 className="font-medium text-sidebar-primary mb-2">
                        {dateKey}
                      </h3>
                      <ul className="space-y-1 pl-2">
                        {groupedEntries[dateKey].map((entry) => (
                          <li
                            key={entry.name}
                            className={`p-1 rounded cursor-pointer hover:bg-sidebar-accent ${
                              selectedEntry === entry.name
                                ? "bg-sidebar-accent"
                                : ""
                            }`}
                            onClick={() => loadEntryContent(entry.name)}
                          >
                            <div className="text-sm">
                              {formatDateTime(entry.modifiedTime, "time-only")}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="w-2/3 pl-4">
            {selectedEntry ? (
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedEntry}</h3>
                <div className="p-4 bg-card rounded-lg whitespace-pre-wrap">
                  {entryContent}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a file to view its content</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalEntries;
