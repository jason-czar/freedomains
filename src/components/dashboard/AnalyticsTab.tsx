
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StatCard = ({ title, value, bgClass }: { title: string; value: string; bgClass: string }) => (
  <div className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 ${bgClass}`}>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-gray-400">{title}</div>
  </div>
);

const AnalyticsTab: React.FC = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <h2 className="text-2xl font-bold mb-6 text-white">Analytics</h2>
      <p className="text-gray-300 mb-6">
        Track the performance of your domains with comprehensive analytics.
      </p>
      
      <Tabs defaultValue="traffic">
        <TabsList className="grid grid-cols-4 mb-6 bg-gray-900/60 p-1">
          <TabsTrigger value="traffic" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">Traffic</TabsTrigger>
          <TabsTrigger value="referrers" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">Referrers</TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">Devices</TabsTrigger>
          <TabsTrigger value="locations" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">Locations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traffic" className="space-y-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-600">Traffic Chart</div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Total Visits"
              value="2,096"
              bgClass="border-indigo-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(79,70,229,0.1)]"
            />
            <StatCard
              title="Unique Visitors"
              value="1,245"
              bgClass="border-emerald-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(16,185,129,0.1)]"
            />
            <StatCard
              title="Avg. Time"
              value="3:42"
              bgClass="border-blue-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(59,130,246,0.1)]"
            />
            <StatCard
              title="Bounce Rate"
              value="28%"
              bgClass="border-orange-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_1px_3px_rgba(249,115,22,0.1)]"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="referrers">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-600">Referrers Chart</div>
          </div>
        </TabsContent>
        
        <TabsContent value="devices">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-600">Devices Chart</div>
          </div>
        </TabsContent>
        
        <TabsContent value="locations">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-600">Locations Map</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
