
import React from "react";

const DomainInstructions: React.FC = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Next Steps After Domain Registration</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-blue-800">For Standard Domains:</h4>
          <ol className="list-decimal pl-5 space-y-2 text-blue-800">
            <li>After registering your domain, you need to add it to your Vercel project.</li>
            <li>Go to your Vercel project settings, find the "Domains" section, and add your new domain.</li>
            <li>Vercel will automatically verify the domain (we've set up the verification CNAME for you).</li>
            <li>Once verified, your domain will start working with your Vercel project.</li>
          </ol>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-800">For Delegated Domains:</h4>
          <ol className="list-decimal pl-5 space-y-2 text-blue-800">
            <li>After registering your delegated domain, DNS requests will be directed to your nameservers.</li>
            <li>Set up your DNS hosting service (Cloudflare, Route53, etc.) to recognize this domain.</li>
            <li>Add the required DNS records to your DNS hosting service to start receiving traffic.</li>
            <li>You have full control to set up websites, email services, or any other services on your domain.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DomainInstructions;
