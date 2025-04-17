
import React from "react";
import { FileText } from "lucide-react";

interface DomainRecentActivityProps {
  domains: any[];
}

const DomainRecentActivity: React.FC<DomainRecentActivityProps> = ({ domains }) => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <h3 className="font-semibold text-lg mb-4 text-white">Recent Activity</h3>
      {domains.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.slice(0, 4).map((domain, index) => (
            <div key={index} className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-indigo-900/40 border border-indigo-500/20 flex-shrink-0 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-gray-300">Domain registered</p>
                <p className="text-sm text-gray-400">
                  {domain.subdomain}.com.channel • {new Date(domain.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DomainRecentActivity;
