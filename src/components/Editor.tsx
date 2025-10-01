import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";

interface TiptapProps {
  content: string;
}

const Tiptap = ({ content }: TiptapProps) => {
  const editor = useEditor({
    content,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "tiptap field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 text-base",
      },
    },
  });

  return <EditorContent editor={editor} />;
};

function JournalEditor() {
  const [content, setContent] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const contentRef = useRef(content);
  const currentFilePathRef = useRef(currentFilePath);

  // Keep refs updated
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    currentFilePathRef.current = currentFilePath;
  }, [currentFilePath]);

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
      }
      return;
    }
    const res = await window.api.saveToPath(existingPath, text);
    if (!res.success) {
      // If direct save failed, try save as
      const result = await window.api.saveWithDialog(text, existingPath);
      if (result.success && result.filePath) {
        setCurrentFilePath(result.filePath);
      }
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
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, handleSaveAs]);

  return (
    <div className="@container w-full max-w-full px-2 sm:px-4 mt-12 md:px-6 lg:max-w-4xl mx-auto space-y-4">
      <Tiptap content={content} />
    </div>
  );
}

export default JournalEditor;
