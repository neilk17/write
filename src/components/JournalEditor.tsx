import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import getFormattedTimestamp from "../lib/dates";
import { Button } from "./ui/button";

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

function JournalEditor({ selectedFolder }: { selectedFolder: string }) {
  const [content, setContent] = useState("");

  const handleSave = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      const fileName = `${getFormattedTimestamp()}.txt`;
      const filePath = await window.api.saveFile(
        selectedFolder,
        fileName,
        content
      );
      if (filePath) {
        setContent("");
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
    }
  };

  return (
    <div className="@container w-full max-w-full px-2 sm:px-4 md:px-6 lg:max-w-4xl mx-auto space-y-4">
      <Tiptap content={content} onUpdate={setContent} />
      <div className="flex justify-between items-center">
        <Button
          onClick={handleSave}
          disabled={!content.trim()}
          size="sm"
          className="w-full sm:w-auto"
          variant={content.trim() ? "default" : "outline"}
        >
          <span className="text-sm sm:text-base">Save</span>
        </Button>
      </div>
    </div>
  );
}

export default JournalEditor;
