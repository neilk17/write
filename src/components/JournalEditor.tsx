import { EditorProvider } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useState } from "react";
import getFormattedTimestamp from "../lib/dates";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Save } from "lucide-react";

const extensions = [StarterKit];

interface TiptapProps {
  content: string;
}

const Tiptap = ({ content }: TiptapProps) => {
  return (
    <EditorProvider extensions={extensions} content={content}>
      {/* <FloatingMenu editor={null}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={null}>This is the bubble menu</BubbleMenu> */}
    </EditorProvider>
  );
};

function JournalEditor({ selectedFolder }: { selectedFolder: string }) {
  const [content, setContent] = useState("Start writing");

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
      <div className="editor-container">
        <Tiptap content={content} />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-64 p-4"
        />
        <Button onClick={handleSave} disabled={!content.trim()}>
          <Save />
        </Button>
      </div>
    </div>
  );
}

export default JournalEditor;
