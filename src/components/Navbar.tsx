import { Button } from "@/components/ui/button";
import { BookOpen, PencilLine } from "lucide-react";
import { NavActions } from "./nav-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

interface CustomNavbarProps {
  currentFileName: string | null;
  saveStatus: "idle" | "saving" | "saved";
  showSavedIndicator: boolean;
  mode: "write" | "read";
  onToggleMode: () => void;
}


export default function Navbar({
  currentFileName,
  saveStatus,
  showSavedIndicator,
  mode,
  onToggleMode,
}: CustomNavbarProps) {
  const isMac = window.api.isMac;
  return (
    <nav className={`bg-sidebar navbar flex flex-row border-b navbar ${isMac ? "" : "pr-28"}`}>
      <div className={`${isMac ? "ml-12" : ""} flex flex-1 items-center gap-2 px-3`}>
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
                {currentFileName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span className="text-sm text-muted-foreground">
          {saveStatus === "saved" && (
            <span
              className={`transition-opacity duration-1000 ease-out ${
                showSavedIndicator ? "opacity-100" : "opacity-0"
              }`}
            >
              ✓ Saved
            </span>
          )}
        </span>
      </div>
      <Button
        onClick={onToggleMode}
        size="icon"
        variant="ghost"
        className="navbar-button"
      >
        {mode === "write" ? (
          <BookOpen className="h-4 w-4" />
        ) : (
          <PencilLine className="h-4 w-4" />
        )}
      </Button>
      <NavActions />
    </nav>
  );
}
