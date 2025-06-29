import { BookOpen, FolderCog, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { NavActions } from "./nav-actions";

interface CustomNavbarProps {
  currentFileName: string | null;
  saveStatus: "idle" | "saving" | "saved";
  showSavedIndicator: boolean;
}

/**
 * A fixed, VSCode-style top navigation bar that stays on top of
 * everything.  Designed to be lightweight and easily reusable.
 */
export default function Navbar({
  currentFileName,
  saveStatus,
  showSavedIndicator,
}: CustomNavbarProps) {
  return (
    <nav className="ml-12 flex flex-row border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
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
      </div>
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
      <NavActions />
    </nav>
  );
}
