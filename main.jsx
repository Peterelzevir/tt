import React from 'react';
import { createRoot } from 'react-dom/client';
import TikTokDownloader from './down';
import './styles.css'; // Assuming you'll create a styles.css file for global styles

// Entry point for the application
const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <TikTokDownloader />
    </div>
  );
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(<App />);
});
