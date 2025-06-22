import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import getFormattedTimestamp from "../lib/dates";

const extensions = [StarterKit];

interface TiptapProps {
  content: string;
  onUpdate: (content: string) => void;
}

const Tiptap = ({ content, onUpdate }: TiptapProps) => {
  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getText());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap placeholder:text-muted-foreground field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 text-base",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      if (content === "") {
        editor.commands.setContent("");
      }
      editor.commands.focus();
    }
  }, [content, editor]);

  return (
    <>
      <EditorContent editor={editor} />
    </>
  );
};

function JournalEditor({
  selectedFolder,
  onFileUpdate,
  onSaveStatusChange,
}: {
  selectedFolder: string;
  onFileUpdate?: (fileName: string | null) => void;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved") => void;
}) {
  const [content, setContent] = useState("");
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = async (newContent?: string) => {
    const contentToSave = newContent || content;
    if (!contentToSave.trim()) {
      return;
    }

    onSaveStatusChange?.("saving");

    try {
      let fileName = currentFileName;
      if (!fileName) {
        fileName = `${getFormattedTimestamp()}.txt`;
        setCurrentFileName(fileName);
        onFileUpdate?.(fileName);
      }
      await window.api.saveFile(selectedFolder, fileName, contentToSave);
      onSaveStatusChange?.("saved");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      onSaveStatusChange?.("idle");
    }
  };

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent);
    clearTimeout(autosaveTimeoutRef.current);
    onSaveStatusChange?.("idle");

    if (newContent.trim()) {
      autosaveTimeoutRef.current = setTimeout(() => {
        handleSave(newContent);
      }, 2000);
    }
  };

  return (
    <div className="@container w-full max-w-full px-2 sm:px-4 md:px-6 lg:max-w-4xl mx-auto space-y-4">
      <Tiptap content={content} onUpdate={handleContentUpdate} />
    </div>
  );
}

export default JournalEditor;
