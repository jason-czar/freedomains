
import React from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="py-20">
          <div className="clay-container">
            <div className="max-w-3xl mx-auto clay-panel p-8">
              <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
              <p className="text-xl text-center text-gray-600 mb-8">
                Get in touch with our team
              </p>
              <div className="text-center">
                <a 
                  href="mailto:jason@com.channel" 
                  className="clay-button-primary inline-block text-lg"
                >
                  jason@com.channel
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
