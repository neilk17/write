const getFormattedTimestamp = () => {
    const currentDate = new Date();
    const year = String(currentDate.getFullYear()).slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const fileName = `${year}${month}${day}-${hours}${minutes}${seconds}`;

    return fileName;
};

export const extractParentFromFilename = (filename: string): string | null => {
    if (filename.includes('--reply-')) {
        return filename.split('--reply-')[0] + '.txt';
    }
    return null;
};

export const isReplyFile = (filename: string): boolean => {
    return filename.includes('--reply-');
};

export const createReplyFilename = (parentFilename: string): string => {
    const parentBase = parentFilename.replace('.txt', '');
    const timestamp = getFormattedTimestamp();
    return `${parentBase}--reply-${timestamp}.txt`;
};

export default getFormattedTimestamp;