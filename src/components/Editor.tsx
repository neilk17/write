import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import getFormattedTimestamp from "../lib/dates";

interface TiptapProps {
  content: string;
  onUpdate: (content: string) => void;
}

const Tiptap = ({ content, onUpdate }: TiptapProps) => {
  const editor = useEditor({
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getText());
    },
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write…",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 text-base focus:outline-none",
      },
    },
  });

  return <EditorContent editor={editor} />;
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
  const contentRef = useRef(content);
  const currentFileNameRef = useRef(currentFileName);

  // Keep refs updated
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    currentFileNameRef.current = currentFileName;
  }, [currentFileName]);

  // Save pending content when component unmounts
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        // Save immediately if there's unsaved content
        if (contentRef.current.trim()) {
          const contentToSave = contentRef.current;
          let fileName = currentFileNameRef.current;
          if (!fileName) {
            fileName = `${getFormattedTimestamp()}.txt`;
          }
          // Fire and forget - can't await in cleanup
          window.api.saveFile(selectedFolder, fileName, contentToSave);
        }
      }
    };
  }, [selectedFolder]); // Only selectedFolder in deps since it's from props

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
      onFileUpdate?.(fileName);
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
    <div className="@container w-full max-w-full px-2 sm:px-4 py-4 md:px-6 lg:max-w-3xl mx-auto space-y-4 min-h-0 flex-1">
      <div className="h-full overflow-auto">
        <Tiptap content={content} onUpdate={handleContentUpdate} />
      </div>
    </div>
  );
}

export default JournalEditor;
