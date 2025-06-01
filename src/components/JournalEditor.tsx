import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Save } from "lucide-react";
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
          "tiptap placeholder:text-muted-foreground dark:bg-input/30 field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
      const fileName = getFormattedTimestamp();
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
    <div className="journal-editor">
      <div className="editor-container space-y-4">
        <Tiptap content={content} onUpdate={setContent} />
        <div className="">
          <Button onClick={handleSave} disabled={!content.trim()}>
            <Save className="mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default JournalEditor;
