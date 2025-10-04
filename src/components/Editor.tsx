import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";

interface TiptapProps {
  content: string;
  onChange: (value: string) => void;
}

const Tiptap = ({ content, onChange }: TiptapProps) => {
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        code: false,
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 text-base",
      },
    },
    onUpdate: ({ editor }) => {
      // Preserve line breaks: TipTap paragraphs become newlines
      onChange(editor.getText({ blockSeparator: '\n' }));
    },
  });

  // Keep editor content in sync when parent content prop changes (e.g., opening a file)
  useEffect(() => {
    if (!editor) return;
    // If the incoming content is plain text, convert line breaks to paragraphs
    const html = content
      .split(/\r?\n/)
      .map((line) =>
        line.length === 0
          ? "<p></p>"
          : `<p>${line
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</p>`
      )
      .join("");
    const current = editor.getText({ blockSeparator: '\n' });
    if (current !== content) {
      editor.commands.setContent(html, false);
    }
  }, [editor, content]);

  return <EditorContent editor={editor} />;
};

function JournalEditor() {
  const [content, setContent] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const hideSaveMsgTimeoutRef = useRef<number | null>(null);
  const contentRef = useRef(content);
  const currentFilePathRef = useRef(currentFilePath);

  // Keep refs updated
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    currentFilePathRef.current = currentFilePath;
  }, [currentFilePath]);

  const updateRecentFiles = useCallback(async (newPath: string) => {
    try {
      const stat = await window.api.statPath(newPath);
      const createdAtMs =
        stat.success && stat.createdAtMs ? stat.createdAtMs : Date.now();
      const raw = localStorage.getItem("recentFiles");
      const parsed = raw ? JSON.parse(raw) : [];
      const list: { path: string; createdAtMs: number }[] = Array.isArray(
        parsed
      )
        ? parsed.map((item: { path: string; createdAtMs: number } | string) =>
            typeof item === "string"
              ? { path: item, createdAtMs }
              : { path: item.path, createdAtMs: item.createdAtMs }
          )
        : [];
      const filtered = list.filter(
        (it) => it.path !== newPath && it.path !== currentFilePathRef.current
      );
      const next = [{ path: newPath, createdAtMs }, ...filtered]
        .sort((a, b) => b.createdAtMs - a.createdAtMs)
        .slice(0, 10);
      localStorage.setItem("recentFiles", JSON.stringify(next));
      window.dispatchEvent(new Event("recent-files-changed"));
    } catch (_error) {
      // ignore parse errors
    }
  }, []);

  const formatPathForDisplay = useCallback((filePath: string) => {
    // Collapse /Users/<name> to ~ for macOS-like paths
    return filePath.replace(/^\/Users\/[^/]+/, "~");
  }, []);

  const showSavedMessage = useCallback(
    (filePath: string) => {
      const shortPath = formatPathForDisplay(filePath);
      setSaveMessage(`Saved '${shortPath}'`);
      if (hideSaveMsgTimeoutRef.current) {
        window.clearTimeout(hideSaveMsgTimeoutRef.current);
      }
      hideSaveMsgTimeoutRef.current = window.setTimeout(() => {
        setSaveMessage(null);
        hideSaveMsgTimeoutRef.current = null;
      }, 2000);
    },
    [formatPathForDisplay]
  );

  const handleSave = useCallback(async () => {
    const text = contentRef.current;
    const existingPath = currentFilePathRef.current;
    if (!text || text.trim().length === 0) {
      return;
    }
    if (!existingPath) {
      const result = await window.api.saveWithDialog(text);
      if (result.success && result.filePath) {
        setCurrentFilePath(result.filePath);
        // Append new file to end of list without reordering existing entries
        try {
          const raw = localStorage.getItem("recentFiles");
          const parsed = raw ? JSON.parse(raw) : [];
          const list: { path: string; createdAtMs: number }[] = Array.isArray(
            parsed
          )
            ? parsed.map(
                (item: { path: string; createdAtMs: number } | string) =>
                  typeof item === "string"
                    ? { path: item, createdAtMs: 0 }
                    : { path: item.path, createdAtMs: item.createdAtMs }
              )
            : [];
          const exists = list.find((it) => it.path === result.filePath);
          const next = exists
            ? list
            : [...list, { path: result.filePath, createdAtMs: Date.now() }];
          localStorage.setItem("recentFiles", JSON.stringify(next));
          window.dispatchEvent(new Event("recent-files-changed"));
        } catch (error) {
          // Fallback: if localStorage update fails, still emit change event
          window.dispatchEvent(new Event("recent-files-changed"));
        }
        // Also keep metadata path/time updated for other flows
        updateRecentFiles(result.filePath);
        showSavedMessage(result.filePath);
      }
      return;
    }
    const res = await window.api.saveToPath(existingPath, text);
    if (!res.success) {
      // If direct save failed, try save as
      const result = await window.api.saveWithDialog(text, existingPath);
      if (result.success && result.filePath) {
        setCurrentFilePath(result.filePath);
        updateRecentFiles(result.filePath);
        showSavedMessage(result.filePath);
      }
    } else {
      showSavedMessage(existingPath);
    }
  }, []);

  const handleSaveAs = useCallback(async () => {
    const text = contentRef.current;
    if (!text || text.trim().length === 0) {
      return;
    }
    const result = await window.api.saveWithDialog(
      text,
      currentFilePathRef.current ?? undefined
    );
    if (result.success && result.filePath) {
      setCurrentFilePath(result.filePath);
      updateRecentFiles(result.filePath);
      showSavedMessage(result.filePath);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAs();
        } else {
          handleSave();
        }
        return;
      }
      if (cmd && e.key.toLowerCase() === "o") {
        e.preventDefault();
        window.api.openWithDialog().then((result) => {
          if (result.success && result.filePath) {
            updateRecentFiles(result.filePath);
            const event = new CustomEvent("open-file", {
              detail: { filePath: result.filePath, content: result.content },
            });
            window.dispatchEvent(event);
            window.dispatchEvent(new Event("recent-files-changed"));
          }
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, handleSaveAs]);

  // Listen for open-file events from the sidebar
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ filePath: string; content: string }>)
        .detail;
      setCurrentFilePath(detail.filePath);
      setContent(detail.content);
    };
    window.addEventListener(
      "open-file" as unknown as keyof WindowEventMap,
      onOpen as EventListener
    );
    return () =>
      window.removeEventListener(
        "open-file" as unknown as keyof WindowEventMap,
        onOpen as EventListener
      );
  }, []);

  return (
    <div className="@container w-full max-w-full px-2 sm:px-4 mt-12 md:px-6 lg:max-w-4xl mx-auto space-y-4">
      <Tiptap content={content} onChange={setContent} />
      {saveMessage && (
        <div className="text-sm text-muted-foreground select-none">
          {saveMessage}
        </div>
      )}
    </div>
  );
}

export default JournalEditor;
