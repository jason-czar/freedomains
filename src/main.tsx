
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable AI feedback loop for real-time debugging and issue detection
if (import.meta.env.DEV) {
  console.log('AI real-time debugging enabled');
  
  // Override console methods to enhance logging
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = function(...args) {
    // Add metadata to help AI understand context
    const errorInfo = {
      type: 'error',
      timestamp: new Date().toISOString(),
      location: new Error().stack,
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
    };
    
    // Make this data available to the AI through a window property
    window.__AI_DEBUG_DATA = window.__AI_DEBUG_DATA || [];
    window.__AI_DEBUG_DATA.push(errorInfo);
    
    // Call original method
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args) {
    // Similar approach for warnings
    const warnInfo = {
      type: 'warning',
      timestamp: new Date().toISOString(),
      location: new Error().stack,
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
    };
    
    window.__AI_DEBUG_DATA = window.__AI_DEBUG_DATA || [];
    window.__AI_DEBUG_DATA.push(warnInfo);
    
    originalConsoleWarn.apply(console, args);
  };
  
  // Track runtime component renders and state changes
  window.addEventListener('error', (event) => {
    const errorInfo = {
      type: 'uncaught_error',
      timestamp: new Date().toISOString(),
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    };
    
    window.__AI_DEBUG_DATA = window.__AI_DEBUG_DATA || [];
    window.__AI_DEBUG_DATA.push(errorInfo);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
