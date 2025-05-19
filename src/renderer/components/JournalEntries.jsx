import { useState, useEffect } from 'react';

const formatDate = (timestamp) => {
    const date = new Date(timestamp.replace(/(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/, '20$1-$2-$3T$4:$5:$6'));
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp.replace(/(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/, '20$1-$2-$3T$4:$5:$6'));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getDateKey = (timestamp) => {
    return timestamp.slice(0, 6); // Get YYMMDD part
};

function JournalEntries({ selectedFolder }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadEntries = async () => {
            if (!selectedFolder) {
                setLoading(false);
                return;
            }

            try {
                const entriesList = await window.api.listEntries(selectedFolder);
                setEntries(entriesList);
                setError(null);
            } catch (err) {
                setError('Failed to load entries: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadEntries();
    }, [selectedFolder]);

    if (!selectedFolder) {
        return <div>Please select a folder first</div>;
    }

    if (loading) {
        return <div>Loading entries...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (entries.length === 0) {
        return <div>No entries found in this folder</div>;
    }

    // Group entries by date
    const entriesByDate = entries.reduce((groups, entry) => {
        const dateKey = getDateKey(entry.timestamp);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(entry);
        return groups;
    }, {});

    // Sort dates in descending order
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

    return (
        <div className="journal-entries p-8">
            <h2 className="text-xl font-bold mb-4">{entries.length} Entries</h2>
            <div className="entries-list space-y-8">
                {sortedDates.map(dateKey => {
                    const dateEntries = entriesByDate[dateKey];
                    const firstEntry = dateEntries[0];
                    return (
                        <div key={dateKey} className="date-group">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                {formatDate(firstEntry.timestamp)}
                            </h3>
                            <div className="entries-for-date space-y-4">
                                {dateEntries.map(entry => (
                                    <div key={entry.filename} className="entry p-4 bg-gray-50 rounded-lg">
                                        <div className="entry-header mb-2">
                                            <span className="text-sm text-gray-600">
                                                {formatTime(entry.timestamp)}
                                            </span>
                                        </div>
                                        <div className="entry-content whitespace-pre-wrap">
                                            {entry.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default JournalEntries;