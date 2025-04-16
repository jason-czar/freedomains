
import React from "react";
import { Loader2 } from "lucide-react";

const DNSLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );
};

export default DNSLoadingState;
