import { Search } from "lucide-react";
import * as React from "react";

import { NavJournalEntries } from "@/components/nav-journal-entries";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  selectedFolder: string;
  selectedEntry?: string | null;
  onEntrySelect?: (name: string) => void;
  searchDialogOpen?: boolean;
  onSearchDialogOpenChange?: (open: boolean) => void;
}

export function AppSidebar({
  selectedFolder,
  selectedEntry,
  onEntrySelect,
  searchDialogOpen = false,
  ...props
}: AppSidebarProps) {
  return (
    <>
      <Sidebar className="border-r-0 mt-[36px]" {...props}>
        <SidebarContent>
          <NavJournalEntries
            selectedFolder={selectedFolder}
            selectedEntry={selectedEntry}
            onSelectEntry={onEntrySelect}
          />
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
