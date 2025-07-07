import { AppSidebar } from "@/components/app-sidebar";
import Editor from "@/components/Editor";
import Navbar from "@/components/Navbar";
import Reader from "@/components/Reader";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [defaultPath, setDefaultPath] = useState("");
  const [mode, setMode] = useState<"write" | "read">("write");
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const refreshEntriesRef = useRef<(() => Promise<void>) | null>(null);
  
  // Store the refresh function in a ref to avoid re-render cycles
  const handleSetRefreshEntries = (fn: (() => Promise<void>) | null) => {
    console.log("setRefreshEntries called with:", typeof fn, fn);
    refreshEntriesRef.current = fn;
  };

  // Triggered by sidebar click
  const handleEntrySelect = (name: string) => {
    setCurrentFileName(name); // remember which file
    setMode("read"); // switch UI to read mode
  };

  // Handle file saved - refresh sidebar
  const handleFileUpdate = (fileName: string | null) => {
    setCurrentFileName(fileName);
    // Refresh sidebar to show new file
    if (refreshEntriesRef.current && typeof refreshEntriesRef.current === 'function') {
      refreshEntriesRef.current().catch(console.error);
    }
  };
  useEffect(() => {
    if (saveStatus === "saved") {
      setShowSavedIndicator(true);
      const timer = setTimeout(() => {
        setShowSavedIndicator(false);
        setSaveStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

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
        <SidebarProvider className="flex flex-col min-h-svh">
          {/* Fixed Top bar */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <Navbar
              currentFileName={currentFileName}
              saveStatus={saveStatus}
              showSavedIndicator={showSavedIndicator}
              mode={mode}
              onToggleMode={() =>
                setMode((prev) => (prev === "write" ? "read" : "write"))
              }
            />
          </div>

          <div className="flex flex-1 min-h-0 pt-12">
            <AppSidebar
              selectedFolder={selectedFolder}
              selectedEntry={currentFileName}
              onEntrySelect={handleEntrySelect}
              onRefreshEntries={handleSetRefreshEntries}
            />
            <SidebarInset className="flex-1 overflow-auto">
              <div className="@container px-2 sm:px-4 md:px-6 h-full flex flex-col">
                {mode === "write" ? (
                  <Editor
                    selectedFolder={selectedFolder}
                    onFileUpdate={handleFileUpdate}
                    onSaveStatusChange={setSaveStatus}
                  />
                ) : (
                  <Reader
                    selectedFolder={selectedFolder}
                    initialEntry={currentFileName}
                  />
                )}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
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

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = createRoot(rootElement);
root.render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <App />
  </ThemeProvider>
);
