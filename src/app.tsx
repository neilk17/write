import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import JournalEditor from "./components/JournalEditor";
import JournalEntries from "./components/JournalEntries";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { PencilLine, BookOpen, FolderCog } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";

function App() {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [defaultPath, setDefaultPath] = useState("");
  const [mode, setMode] = useState("write"); // 'write' or 'read'

  useEffect(() => {
    const loadDefaultPath = async () => {
      try {
        const config = await window.api.getConfig();
        if (config.defaultPath) {
          setDefaultPath(config.defaultPath);
          setSelectedFolder(config.defaultPath);
        }
      } catch (error) {
        console.error("Error loading default path:", error);
      }
    };
    loadDefaultPath();
  }, []);

  const handleFolderSelect = async () => {
    try {
      const folder = await window.api.selectDirectory();
      if (folder) {
        setSelectedFolder(folder);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  const handleUseDefaultPath = () => {
    setSelectedFolder(defaultPath);
  };

  return (
    <>
      {selectedFolder ? (
        <>
          <div className="flex justify-end m-6 space-x-4 items-center">
            <ThemeToggle />
            {mode === "write" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setMode("read")}>
                    <BookOpen />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Read</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setMode("write")}>
                    <PencilLine />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Write</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleFolderSelect}>
                  <FolderCog />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change folder</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {mode === "write" ? (
            <JournalEditor selectedFolder={selectedFolder} />
          ) : (
            <JournalEntries selectedFolder={selectedFolder} />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="mt-8"></div>
          <h1 className="text-2xl font-bold">Welcome to write.</h1>
          <p>The goal of this app is to minimize the friction in writing.</p>
          {defaultPath && (
            <div className="mb-4">
              <p className="text-sm mb-2">Previous folder: {defaultPath}</p>
              <Button onClick={handleUseDefaultPath}>
                Use previous folder
              </Button>
            </div>
          )}
          <Button onClick={handleFolderSelect}>
            Choose a different folder
          </Button>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}

const root = createRoot(document.body);
root.render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <App />
  </ThemeProvider>
);
