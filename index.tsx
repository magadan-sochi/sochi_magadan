
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("index.tsx script loaded and executing.");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element with ID 'root' not found in the DOM.");
  throw new Error("Could not find root element to mount to");
} else {
  console.log("Found root element:", rootElement);
}

const root = ReactDOM.createRoot(rootElement);
console.log("React root created. Rendering App component...");
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log("App component rendered into root.");
