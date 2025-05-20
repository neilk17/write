import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import JournalEditor from './components/JournalEditor';
import JournalEntries from './components/JournalEntries';
import '../../styles.css';

function App() {
    const [selectedFolder, setSelectedFolder] = useState('');
    const [defaultPath, setDefaultPath] = useState('');
    const [mode, setMode] = useState('write'); // 'write' or 'read'

    useEffect(() => {
        const loadDefaultPath = async () => {
            try {
                const config = await window.api.getConfig();
                if (config.defaultPath) {
                    setDefaultPath(config.defaultPath);
                    setSelectedFolder(config.defaultPath);
                }
            } catch (error) {
                console.error('Error loading default path:', error);
            }
        };
        loadDefaultPath();
    }, []);

    const handleFolderSelect = async () => {
        try {
            const folder = await window.api.selectDirectory();
            if (folder) {
                setSelectedFolder(folder);
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
        }
    };

    const handleUseDefaultPath = () => {
        setSelectedFolder(defaultPath);
    };

    return (
        <>
            {selectedFolder ? (
                <div className='p-8'>
                    <div className='flex justify-end m-6 space-x-4'>
                        {mode === 'write' ? (
                            <button
                                onClick={() => setMode('read')}
                                className='hover:cursor-pointer px-4 py-2 rounded bg-gray-200'
                            >
                                Read
                            </button>
                        ) : (
                            <button
                                onClick={() => setMode('write')}
                                className='hover:cursor-pointer px-4 py-2 rounded bg-gray-200'
                            >
                                Write
                            </button>
                        )}
                        <button
                            onClick={handleFolderSelect}
                            className='text-sm text-gray-600 hover:text-gray-800'
                        >
                            Change Folder
                        </button>
                    </div>
                    {mode === 'write' ? (
                        <JournalEditor selectedFolder={selectedFolder} />
                    ) : (
                        <JournalEntries selectedFolder={selectedFolder} />
                    )}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center h-screen'>
                    <div className='mt-8'></div>
                    <h1 className='text-2xl font-bold'>Welcome to write.</h1>
                    <p>The goal of this app is to minimize the friction in writing.</p>
                    {defaultPath && (
                        <div className='mb-4'>
                            <p className='text-sm mb-2'>Previous folder: {defaultPath}</p>
                            <button onClick={handleUseDefaultPath} className='mr-2'>Use previous folder</button>
                        </div>
                    )}
                    <button onClick={handleFolderSelect}>Choose a different folder</button>
                </div>
            )}
        </>
    );

}

createRoot(document.getElementById('root')).render(<App />);
