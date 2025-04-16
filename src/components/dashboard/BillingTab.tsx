
import React from "react";
import { Button } from "@/components/ui/button";

const BillingTab: React.FC = () => {
  return (
    <div className="clay-card">
      <h2 className="text-2xl font-bold mb-6">Billing</h2>
      <p className="text-gray-600 mb-6">
        Manage your subscription and billing information.
      </p>
      
      <div className="mb-8">
        <div className="bg-clay-lavender/30 rounded-clay p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Professional Plan</h3>
            <span className="bg-clay-lavender px-3 py-1 rounded-full text-indigo-700 text-sm font-medium">
              Active
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-600">Renews on October 15, 2023</p>
              <p className="text-2xl font-bold mt-1">$24.99<span className="text-base font-normal text-gray-600">/month</span></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" className="clay-button bg-white text-gray-700">
                Cancel Plan
              </Button>
              <Button className="clay-button-primary">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
        <div className="clay-card bg-white flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center mr-4">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" fill="#0F172A" />
                <path d="M2 10H22" stroke="#F1F5F9" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-gray-600">Expires 12/2025</p>
            </div>
          </div>
          <Button variant="ghost" className="clay-button bg-white text-indigo-600">
            Update
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Billing History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="py-3 text-left font-semibold text-gray-600">Description</th>
                <th className="py-3 text-left font-semibold text-gray-600">Amount</th>
                <th className="py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="py-3 text-left font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Sep 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
                { date: "Aug 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
                { date: "Jul 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
              ].map((invoice, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">{invoice.date}</td>
                  <td className="py-3">{invoice.description}</td>
                  <td className="py-3">{invoice.amount}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" className="text-gray-600 hover:text-indigo-600" size="sm">
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
