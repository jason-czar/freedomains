
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const PaymentMethodsTab = () => {
  const paymentMethods = [
    {
      type: "Discover",
      last4: "3018",
      expiry: "10/2025",
      address: "3700 Clawson Rd, Austin, Texas",
      lastUsed: "4/14/2025",
      isBackup: true
    },
    // Add more dummy data as needed
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paymentMethods.map((method, idx) => (
        <Card key={idx} className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                {method.type} •••• {method.last4}
              </h3>
              <p className="text-gray-400">Exp {method.expiry}</p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-400">
              <p>Expires {method.expiry}</p>
              <p>{method.address}</p>
              {method.isBackup && (
                <div className="mt-4">
                  <span className="bg-gray-800 px-3 py-1 rounded-full text-xs">
                    BACKUP PAYMENT
                  </span>
                </div>
              )}
              <p className="mt-4 text-xs">
                LAST USED {method.lastUsed}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="flex items-center justify-center min-h-[200px] border-dashed">
        <Button variant="outline" className="text-indigo-400">
          Add Payment Method
        </Button>
      </Card>
    </div>
  );
};
