
import React from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import LandingPageBuilder from "@/components/ui/landing-page-builder";

const LandingPageBuilderPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10">
        <div className="clay-container">
          <LandingPageBuilder />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPageBuilderPage;
