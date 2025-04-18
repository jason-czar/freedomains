import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SubscriptionsTab = () => {
  const subscriptions: any[] = [
    {
      domain: "NSFWMAKER.COM",
      status: "Expired",
      date: "4/4/2025",
      protection: "No Protection",
      payment: {
        type: "Discover",
        last4: "3018",
        expiry: "10/2025"
      }
    }
  ];

  return (
    <div>
      <div className="rounded-lg border border-gray-800">
        {subscriptions.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-left">
                  <Checkbox />
                </th>
                <th className="p-4 text-left text-gray-400 font-medium">Description</th>
                <th className="p-4 text-left text-gray-400 font-medium">Billing Date</th>
                <th className="p-4 text-left text-gray-400 font-medium">Payment Method</th>
                <th className="w-[48px]"></th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, idx) => (
                <tr key={idx} className="border-b border-gray-800 last:border-none">
                  <td className="p-4">
                    <Checkbox />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">{sub.domain}</div>
                      <div className="text-gray-400 text-sm">{sub.protection}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-red-400">{sub.status}</div>
                      <div className="text-sm text-gray-400">{sub.date}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div>{sub.payment.type} •••• {sub.payment.last4}</div>
                      <div className="text-sm text-gray-400">Exp {sub.payment.expiry}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-gray-400">
            No active subscriptions
          </div>
        )}
      </div>
    </div>
  );
};
