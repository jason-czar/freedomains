
import React from "react";

interface DomainQuickStatsProps {
  domains: any[];
}

const DomainQuickStats: React.FC<DomainQuickStatsProps> = ({ domains }) => {
  return (
    <div className="clay-card">
      <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="clay-card bg-clay-lavender/40">
          <div className="text-2xl font-bold">{domains.length}</div>
          <div className="text-gray-600">Total Domains</div>
        </div>
        <div className="clay-card bg-clay-mint/40">
          <div className="text-2xl font-bold">2,096</div>
          <div className="text-gray-600">Total Traffic</div>
        </div>
        <div className="clay-card bg-clay-blue/40">
          <div className="text-2xl font-bold">{domains.length}</div>
          <div className="text-gray-600">SSL Certificates</div>
        </div>
        <div className="clay-card bg-clay-peach/40">
          <div className="text-2xl font-bold">
            {domains.filter(d => !d.is_active).length}
          </div>
          <div className="text-gray-600">Inactive</div>
        </div>
      </div>
    </div>
  );
};

export default DomainQuickStats;
