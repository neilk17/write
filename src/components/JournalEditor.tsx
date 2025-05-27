import getFormattedTimestamp from "../lib/dates";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
// import getFormattedTimestamp from "../../lib/dates";

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
      <p className="text-xl text-gray-400">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="editor-container">
        <Textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 p-4 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:text-white dark:placeholder-gray-400"
        />
        <Button
          onClick={handleSave}
          disabled={!content.trim()}
          //   className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Save Entry
        </Button>
      </div>
    </div>
  );
}

export default JournalEditor;
