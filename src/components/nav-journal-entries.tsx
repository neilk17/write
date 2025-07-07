import { useEffect, useState } from "react";
import { extractParentFromFilename, isReplyFile } from "@/lib/dates";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface FileEntry {
  name: string;
  createdAt: string;
  modifiedAt: string;
  isReply?: boolean;
  parentFile?: string;
  replies?: FileEntry[];
}

interface GroupedEntries {
  [date: string]: FileEntry[];
}

interface NavJournalEntriesProps {
  selectedFolder: string;
  selectedEntry?: string | null;
  onSelectEntry?: (name: string) => void;
  onLoadEntries?: (loadFn: () => Promise<void>) => void;
}

export function NavJournalEntries({
  selectedFolder,
  selectedEntry,
  onSelectEntry,
  onLoadEntries,
}: NavJournalEntriesProps) {
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedFolder) void loadEntries(selectedFolder);
  }, [selectedFolder]);

  useEffect(() => {
    if (onLoadEntries && selectedFolder) {
      onLoadEntries(() => {
        return loadEntries(selectedFolder);
      });
    }
  }, [onLoadEntries, selectedFolder]);

  const loadEntries = async (folderPath: string) => {
    setLoading(true);
    try {
      const files = await window.api.listEntries(folderPath);

      const processed = files.map((file: FileEntry) => ({
        ...file,
        isReply: isReplyFile(file.name),
        parentFile: extractParentFromFilename(file.name),
        replies: [],
      }));

      const parents = processed.filter((f) => !f.isReply);
      const replies = processed.filter((f) => f.isReply);

      parents.forEach((p) => {
        p.replies = replies.filter((r) => r.parentFile === p.name);
      });

      setGroupedEntries(groupByDate(parents));
    } catch (e) {
      console.error("Error loading journal entries", e);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (entries: FileEntry[]): GroupedEntries => {
    // First, sort all entries by creation date (newest first)
    const sortedEntries = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Then group them by date
    return sortedEntries.reduce((acc: GroupedEntries, e) => {
      const key = new Date(e.createdAt).toLocaleDateString();
      acc[key] = acc[key] ? [...acc[key], e] : [e];
      return acc;
    }, {} as GroupedEntries);
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!selectedFolder) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Journal</SidebarGroupLabel>
      {loading ? (
        <p className="text-sm px-2 py-1">Loading…</p>
      ) : Object.keys(groupedEntries).length === 0 ? (
        <p className="text-sm px-2 py-1">No entries</p>
      ) : (
        Object.keys(groupedEntries)
          .filter((k) => k !== "directories")
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .map((dateKey) => (
            <div key={dateKey} className="mb-1">
              <SidebarMenu className="mb-0.5">
                <SidebarGroupLabel className="text-[10px] font-medium uppercase px-2 py-1 opacity-70">
                  {dateKey}
                </SidebarGroupLabel>
                {groupedEntries[dateKey]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((entry) => (
                    <SidebarMenuItem key={entry.name}>
                      <SidebarMenuButton
                        onClick={() => onSelectEntry?.(entry.name)}
                        className={`justify-between ${
                          selectedEntry === entry.name
                            ? "bg-sidebar-accent text-accent-foreground"
                            : ""
                        }`}
                      >
                        <span>{formatTime(entry.createdAt)}</span>
                        {entry.replies && entry.replies.length > 0 && (
                          <span className="text-muted-foreground text-xs">
                            +{entry.replies.length}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </div>
          ))
      )}
    </SidebarGroup>
  );
}
