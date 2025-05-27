import { useState, useEffect } from "react";

interface FileEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  modifiedTime: string;
}

function JournalEntries({ selectedFolder }: { selectedFolder: string }) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
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

      // Sort entries: directories first, then files by modification time (newest first)
      const sortedEntries = [...files].sort((a, b) => {
        // Always put directories before files
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        // If both are files, sort by modification time (newest first)
        if (a.isFile && b.isFile) {
          return (
            new Date(b.modifiedTime).getTime() -
            new Date(a.modifiedTime).getTime()
          );
        }

        // If both are directories, sort alphabetically
        return a.name.localeCompare(b.name);
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
      // Only try to read content if it's a file
      const entry = entries.find((e) => e.name === filename);
      if (entry && entry.isFile) {
        const content = await window.api.readFile(currentPath, filename);
        setEntryContent(content);
        setSelectedEntry(filename);
      }
    } catch (error) {
      console.error("Error loading entry content:", error);
    }
  };

  const handleEntryClick = (entry: FileEntry) => {
    if (entry.isDirectory) {
      // Navigate into the directory
      const newPath = `${currentPath}/${entry.name}`.replace(/\/\//g, "/");
      setCurrentPath(newPath);
      loadEntries(newPath);
    } else {
      // Load the file content
      loadEntryContent(entry.name);
    }
  };

  const navigateUp = () => {
    if (currentPath === selectedFolder) return;

    const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
    setCurrentPath(parentPath);
    loadEntries(parentPath);
  };

  const getFileIcon = (entry: FileEntry) => {
    if (entry.isDirectory) {
      return "📁";
    } else if (entry.name.endsWith(".md")) {
      return "📝";
    } else if (entry.name.endsWith(".txt")) {
      return "📄";
    } else if (
      entry.name.endsWith(".jpg") ||
      entry.name.endsWith(".png") ||
      entry.name.endsWith(".gif")
    ) {
      return "🖼️";
    } else {
      return "📄";
    }
  };

  const formatDateTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date created from timestamp:", timestamp);
        return "Unknown date";
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error with date";
    }
  };

  return (
    <div className="journal-entries">
      <h2 className="text-2xl font-bold mb-4">Directory Contents</h2>

      {currentPath !== selectedFolder && (
        <button
          onClick={navigateUp}
          className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
        >
          ⬆️ Up to parent directory
        </button>
      )}

      <div className="text-sm text-gray-600 mb-4">
        Current path: {currentPath}
      </div>

      {loading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="flex">
          <div className="w-1/3 pr-4 border-r">
            {entries.length === 0 ? (
              <p>No entries found</p>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li
                    key={entry.name}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                      selectedEntry === entry.name ? "bg-blue-100" : ""
                    }`}
                    onClick={() => handleEntryClick(entry)}
                  >
                    <span className="mr-2">{getFileIcon(entry)}</span>
                    {entry.isDirectory ? (
                      entry.name
                    ) : (
                      <div>
                        <div className="font-medium">
                          {formatDateTime(entry.modifiedTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.name}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="w-2/3 pl-4">
            {selectedEntry ? (
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedEntry}</h3>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
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
