
import React, { useEffect, useState } from 'react';

interface AiDebugHelperProps {
  enabled?: boolean;
}

const AiDebugHelper: React.FC<AiDebugHelperProps> = ({ enabled = true }) => {
  const [isActive, setIsActive] = useState(enabled);
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    if (!isActive) return;
    
    // Set up a periodic check for issues
    const checkInterval = setInterval(() => {
      if (window.__AI_DEBUG_DATA && window.__AI_DEBUG_DATA.length > 0) {
        // Get new issues since last check
        const newIssues = [...window.__AI_DEBUG_DATA];
        window.__AI_DEBUG_DATA = [];
        
        setIssues(prev => [...prev, ...newIssues]);
        
        // Here you could send these issues to an API endpoint
        // that communicates with the AI
        console.log('AI Debug: New issues detected', newIssues);
      }
    }, 5000);
    
    // Clean up
    return () => {
      clearInterval(checkInterval);
    };
  }, [isActive]);
  
  // Don't render anything visible
  return null;
};

export default AiDebugHelper;

// Add TypeScript declaration for window property
declare global {
  interface Window {
    __AI_DEBUG_DATA?: any[];
  }
}
