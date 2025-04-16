
import React from "react";
import { FileText } from "lucide-react";

interface DomainRecentActivityProps {
  domains: any[];
}

const DomainRecentActivity: React.FC<DomainRecentActivityProps> = ({ domains }) => {
  return (
    <div className="clay-card">
      <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
      {domains.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.slice(0, 4).map((domain, index) => (
            <div key={index} className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-clay-lavender/40 flex-shrink-0 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Domain registered</p>
                <p className="text-sm text-gray-600">
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
