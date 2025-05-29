import getFormattedTimestamp from "../lib/dates";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
      <div className="editor-container">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-64 p-4"
        />
        <Button onClick={handleSave} disabled={!content.trim()}>
          Save Entry
        </Button>
      </div>
    </div>
  );
}

export default JournalEditor;
