
import React from "react";

interface DomainQuickStatsProps {
  domains: any[];
}

const DomainQuickStatsCard = ({ title, value, bgClass }: { title: string; value: string | number; bgClass: string }) => (
  <div className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 ${bgClass}`}>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-gray-400">{title}</div>
  </div>
);

const DomainQuickStats: React.FC<DomainQuickStatsProps> = ({ domains }) => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <h3 className="font-semibold text-lg mb-4 text-white">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <DomainQuickStatsCard
          title="Total Domains"
          value={domains.length}
          bgClass="border-indigo-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(79,70,229,0.1)]"
        />
        <DomainQuickStatsCard
          title="Total Traffic"
          value="2,096"
          bgClass="border-emerald-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(16,185,129,0.1)]"
        />
        <DomainQuickStatsCard
          title="SSL Certificates"
          value={domains.length}
          bgClass="border-blue-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(59,130,246,0.1)]"
        />
        <DomainQuickStatsCard
          title="Inactive"
          value={domains.filter(d => !d.is_active).length}
          bgClass="border-orange-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(249,115,22,0.1)]"
        />
      </div>
    </div>
  );
};

export default DomainQuickStats;
