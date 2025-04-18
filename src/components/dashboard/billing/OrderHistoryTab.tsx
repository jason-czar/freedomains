
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const OrderHistoryTab = () => {
  const orders = [
    {
      id: "370773580",
      date: "4/14/2025",
      amount: "$80.17",
      currency: "USD"
    },
    // Add more dummy data as needed
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">124 results</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-gray-400">
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
          <Button variant="outline" size="sm">Filters</Button>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="p-4 text-left">
                <Checkbox />
              </th>
              <th className="p-4 text-left text-gray-400 font-medium">Order #</th>
              <th className="p-4 text-left text-gray-400 font-medium">Billing Date</th>
              <th className="p-4 text-right text-gray-400 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-800 last:border-none">
                <td className="p-4">
                  <Checkbox />
                </td>
                <td className="p-4">
                  <a href="#" className="text-indigo-400 hover:underline">
                    {order.id}
                  </a>
                </td>
                <td className="p-4 text-gray-300">{order.date}</td>
                <td className="p-4 text-right">
                  <span className="font-medium text-gray-300">{order.amount}</span>
                  <span className="text-gray-400 ml-1">{order.currency}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
