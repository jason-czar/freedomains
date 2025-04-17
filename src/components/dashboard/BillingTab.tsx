
import React from "react";
import { Button } from "@/components/ui/button";

const BillingTab: React.FC = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <h2 className="text-2xl font-bold mb-6 text-white">Billing</h2>
      <p className="text-gray-300 mb-6">
        Manage your subscription and billing information.
      </p>
      
      <div className="mb-8">
        <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Professional Plan</h3>
            <span className="bg-indigo-900/60 px-3 py-1 rounded-full text-indigo-400 text-sm font-medium border border-indigo-500/20">
              Active
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-300">Renews on October 15, 2023</p>
              <p className="text-2xl font-bold mt-1 text-white">$24.99<span className="text-base font-normal text-gray-400">/month</span></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-gray-700 bg-black/40 text-gray-300 hover:bg-gray-900 hover:text-white">
                Cancel Plan
              </Button>
              <Button className="bg-gradient-to-r from-emerald-500 to-green-400 text-gray-900 font-semibold hover:brightness-110">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Payment Method</h3>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-16 bg-gray-900 rounded flex items-center justify-center mr-4 border border-gray-800">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" fill="#222" />
                <path d="M2 10H22" stroke="#999" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-300">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/2025</p>
            </div>
          </div>
          <Button variant="outline" className="border-indigo-500/20 text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-900/20">
            Update
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Billing History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-3 text-left font-semibold text-gray-400">Date</th>
                <th className="py-3 text-left font-semibold text-gray-400">Description</th>
                <th className="py-3 text-left font-semibold text-gray-400">Amount</th>
                <th className="py-3 text-left font-semibold text-gray-400">Status</th>
                <th className="py-3 text-left font-semibold text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Sep 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
                { date: "Aug 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
                { date: "Jul 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
              ].map((invoice, index) => (
                <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                  <td className="py-3 text-gray-300">{invoice.date}</td>
                  <td className="py-3 text-gray-300">{invoice.description}</td>
                  <td className="py-3 text-gray-300">{invoice.amount}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-500/20">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" className="text-gray-400 hover:text-indigo-400 hover:bg-transparent" size="sm">
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
