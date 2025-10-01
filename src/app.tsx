import { AppSidebar } from "@/components/app-sidebar";
import Editor from "@/components/Editor";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="app-container relative min-h-svh">
      <SidebarProvider className="flex flex-col min-h-svh">
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-auto">
            <Editor />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

const root = createRoot(document.body);
root.render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <App />
  </ThemeProvider>
);
