import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

type RecentMeta = { path: string; createdAtMs: number } | string;

export function AppSidebar() {
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [recentMeta, setRecentMeta] = useState<RecentMeta[]>([]);

  const getBasename = (filePath: string) => {
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1] || filePath;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentFiles");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const meta: RecentMeta[] = parsed as RecentMeta[];
          setRecentMeta(meta);
          const paths = meta.map(
            (it: { path: string; createdAtMs: number } | string) =>
              typeof it === "string" ? it : it.path
          );
          setRecentFiles(paths);
        }
      }
    } catch (_) {
      // ignore malformed localStorage content
    }
    const reload = () => {
      try {
        const raw = localStorage.getItem("recentFiles");
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          const meta: RecentMeta[] = parsed as RecentMeta[];
          setRecentMeta(meta);
          const paths = meta.map(
            (it: { path: string; createdAtMs: number } | string) =>
              typeof it === "string" ? it : it.path
          );
          setRecentFiles(paths);
        }
      } catch (_error) {
        // ignore parse errors
      }
    };
    window.addEventListener("recent-files-changed", reload);
    return () => window.removeEventListener("recent-files-changed", reload);
  }, []);

  const openRecent = async (filePath: string) => {
    try {
      const res = await window.api.readFromPath(filePath);
      if (res.success) {
        // Keep order stable: update timestamp if present, append if new
        const now = Date.now();
        const asMeta =
          recentMeta.length > 0
            ? recentMeta.map((it) =>
                typeof it === "string" ? { path: it, createdAtMs: 0 } : it
              )
            : recentFiles.map((p) => ({ path: p, createdAtMs: 0 }));
        let found = false;
        const updated = asMeta.map((it) => {
          if (it.path === filePath) {
            found = true;
            return { ...it, createdAtMs: now };
          }
          return it;
        });
        const nextMeta = found
          ? updated
          : [...updated, { path: filePath, createdAtMs: now }];
        const trimmed = nextMeta.slice(-10);
        setRecentMeta(trimmed);
        setRecentFiles(trimmed.map((it) => it.path));
        localStorage.setItem("recentFiles", JSON.stringify(trimmed));
        const event = new CustomEvent("open-file", {
          detail: { filePath, content: res.content },
        });
        window.dispatchEvent(event);
        window.dispatchEvent(new Event("recent-files-changed"));
      }
    } catch (_) {
      // ignore read errors for missing/moved files
    }
  };

  return (
    <>
      <Sidebar className="border-r-0">
        <SidebarContent>
          <div className="px-2 py-1 "></div>
          <div className="px-2 space-y-1">
            {recentFiles.length === 0 ? (
              <div className="px-2 py-1 text-xs opacity-50">
                No recent files
              </div>
            ) : (
              (recentMeta.length > 0 ? recentMeta : recentFiles).map(
                (item: RecentMeta | string) => {
                  const file = typeof item === "string" ? item : item.path;
                  return (
                    <button
                      key={file}
                      className="w-full text-left text-sm px-2 py-1 hover:bg-accent/30 rounded"
                      onClick={() => openRecent(file)}
                      title={file}
                    >
                      {getBasename(file)}
                    </button>
                  );
                }
              )
            )}
          </div>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
