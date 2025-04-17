
import React from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10">
        <div className="clay-container">
          <AnalyticsTab />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnalyticsPage;
