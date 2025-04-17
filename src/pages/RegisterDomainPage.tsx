
import React from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import DomainRegistrationForm from "@/components/domain/DomainRegistrationForm";
import DomainInstructions from "@/components/domain/DomainInstructions";

const RegisterDomainPage = () => {
  const fetchDomains = async () => {
    // This is just a placeholder since we'll redirect after registration
    // The dashboard will fetch domains when mounted
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10 flex items-center justify-center">
        <div className="clay-container w-full">
          <div className="clay-card mb-6">
            <h2 className="text-2xl font-bold mb-6">Register New Domain</h2>
            <DomainRegistrationForm fetchDomains={fetchDomains} />
            <DomainInstructions />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterDomainPage;
