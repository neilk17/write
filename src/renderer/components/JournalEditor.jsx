import { useState } from 'react';

const getFormattedTimestamp = () => {
    const currentDate = new Date();

    const year = String(currentDate.getFullYear()).slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const fileName = `${year}${month}${day}-${hours}${minutes}${seconds}.txt`;

    return fileName;
};

function JournalEditor({ selectedFolder }) {
    const [content, setContent] = useState('');

    const handleSave = async () => {
        if (!content.trim()) {
            return;
        }

        try {
            const fileName = getFormattedTimestamp();
            const filePath = await window.api.saveFile(selectedFolder, fileName, content);
            if (filePath) {
                setContent('');
            }
        } catch (error) {
            console.error('Error saving journal entry:', error);
        }
    };

    return (
        <div className="journal-editor">
            <p>{new Date().toLocaleDateString()}</p>
            <div className="editor-container">
                <textarea
                    placeholder="Write your thoughts..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="content-input border-none w-full"
                />
                <button onClick={handleSave} disabled={!content.trim()}>
                    Save Entry
                </button>
            </div>
        </div>
    );
}

export default JournalEditor;
