import { createRoot } from 'react-dom/client';

function App() {
    return <h1>Hello from React in Electron!</h1>;
}

createRoot(document.getElementById('root')).render(<App />);
