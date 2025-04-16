
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnalyticsTab: React.FC = () => {
  return (
    <div className="clay-card">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <p className="text-gray-600 mb-6">
        Track the performance of your domains with comprehensive analytics.
      </p>
      
      <Tabs defaultValue="traffic">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traffic" className="space-y-4">
          <div className="clay-card h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-300">Traffic Chart</div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="clay-card bg-clay-lavender/40">
              <div className="text-2xl font-bold">2,096</div>
              <div className="text-gray-600">Total Visits</div>
            </div>
            <div className="clay-card bg-clay-mint/40">
              <div className="text-2xl font-bold">1,245</div>
              <div className="text-gray-600">Unique Visitors</div>
            </div>
            <div className="clay-card bg-clay-blue/40">
              <div className="text-2xl font-bold">3:42</div>
              <div className="text-gray-600">Avg. Time</div>
            </div>
            <div className="clay-card bg-clay-peach/40">
              <div className="text-2xl font-bold">28%</div>
              <div className="text-gray-600">Bounce Rate</div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="referrers">
          <div className="clay-card h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-300">Referrers Chart</div>
          </div>
        </TabsContent>
        
        <TabsContent value="devices">
          <div className="clay-card h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-300">Devices Chart</div>
          </div>
        </TabsContent>
        
        <TabsContent value="locations">
          <div className="clay-card h-64 flex items-center justify-center">
            <div className="text-2xl text-gray-300">Locations Map</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
