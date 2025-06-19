import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, FolderCog, PencilLine } from "lucide-react";

import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import JournalEditor from "./components/JournalEditor";
import JournalEntries from "./components/JournalEntries";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/ui/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { cn } from "./lib/utils";

function App() {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [defaultPath, setDefaultPath] = useState("");
  const [mode, setMode] = useState("write");

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
      console.log("Folder selected in renderer:", folder);
      if (folder) {
        setSelectedFolder(folder);
        // Explicitly update the config to ensure the path is saved
        console.log("About to update config from renderer with:", folder);
        const result = await window.api.updateConfig({ defaultPath: folder });
        console.log("Config update result from renderer:", result);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  const handleUseDefaultPath = () => {
    setSelectedFolder(defaultPath);
  };

  return (
    <div className="app-container relative min-h-svh">
      {selectedFolder ? (
        <>
          <div className="@container navbar flex flex-col sm:flex-row justify-between items-center py-2 sm:p-4 md:p-6 gap-2 sm:gap-4">
            <div className="flex items-center justify-end gap-2 @sm:gap-3 @md:gap-4 ml-auto">
              <ThemeToggle />
              {mode === "write" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setMode("read")}
                      size="sm"
                      className="@md:h-10 @md:px-4 navbar-button"
                    >
                      <BookOpen className="h-4 w-4 @md:h-5 @md:w-5" />
                      <span className="sr-only @md:not-sr-only @md:ml-2">
                        Read
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Read</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setMode("write")}
                      size="sm"
                      className="@md:h-10 @md:px-4 navbar-button"
                    >
                      <PencilLine className="h-4 w-4 @md:h-5 @md:w-5" />
                      <span className="sr-only @md:not-sr-only @md:ml-2">
                        Write
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Write</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleFolderSelect}
                    size="sm"
                    className="@md:h-10 @md:px-4 navbar-button"
                  >
                    <FolderCog className="h-4 w-4 @md:h-5 @md:w-5" />
                    <span className="sr-only @md:not-sr-only @md:ml-2">
                      Folder
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change folder</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="@container px-2 sm:px-4 md:px-6">
            {mode === "write" ? (
              <JournalEditor selectedFolder={selectedFolder} />
            ) : (
              <JournalEntries selectedFolder={selectedFolder} />
            )}
          </div>
        </>
      ) : (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
          <div className={cn("flex flex-col gap-6")}>
            <Card className="w-96">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  <div className="">
                    <h1>
                      Welcome to{" "}
                      <span className="realistic-marker-highlight">Write</span>
                    </h1>
                  </div>
                </CardTitle>
                <CardDescription>
                  This app is built for one thing and one thing only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="grid gap-6">
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Save your writings
                      </span>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Button
                        onClick={handleFolderSelect}
                        className="w-full navbar-button"
                      >
                        Select folder
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          {defaultPath && (
            <div className="mb-4">
              <p className="text-sm mb-2">Previous folder: {defaultPath}</p>
              <Button onClick={handleUseDefaultPath}>
                Use previous folder
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.body);
root.render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <App />
  </ThemeProvider>
);
